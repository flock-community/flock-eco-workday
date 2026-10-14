package community.flock.eco.workday.application.services

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.forms.CvForm
import community.flock.eco.workday.application.forms.CvSkillForm
import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvRevision
import community.flock.eco.workday.application.model.CvSkill
import community.flock.eco.workday.application.model.CvSnapshot
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.CvRepository
import community.flock.eco.workday.application.repository.CvRevisionRepository
import community.flock.eco.workday.application.repository.CvRevisionSummary
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.Instant
import java.time.YearMonth
import java.util.UUID

/** Thrown when a CV form cannot be turned into a valid CV. */
sealed class CvValidationException(
    override val message: String,
) : RuntimeException(message)

class CvInvalidInputException(
    message: String,
) : CvValidationException(message)

class CvPersonNotFoundException(
    personId: UUID,
) : CvValidationException("Person $personId not found")

class CvAlreadyExistsException(
    person: Person,
    name: String,
) : CvValidationException("${person.getFullName()} already has a CV named '$name'")

@Service
class CvService(
    private val cvRepository: CvRepository,
    private val cvRevisionRepository: CvRevisionRepository,
    private val personRepository: PersonRepository,
    private val logoService: LogoService,
) {
    fun findAll(pageable: Pageable): Page<Cv> = cvRepository.findAll(pageable)

    fun findAllByPersonUuid(
        personUuid: UUID,
        pageable: Pageable,
    ): Page<Cv> = cvRepository.findAllByPersonUuid(personUuid, pageable)

    fun findByCode(code: String): Cv? = cvRepository.findByCode(code)

    @Transactional
    fun create(form: CvForm): Cv = form.internalize().save()

    /** Saves [form] over the CV with [code]; what the CV held before becomes a revision. */
    @Transactional
    fun update(
        code: String,
        form: CvForm,
    ): Cv? =
        findByCode(code)?.let { existing ->
            val updated = form.internalize(existing)
            val before = existing.snapshot()
            // Saving without changes adds no revision
            if (before != updated.snapshot()) {
                cvRevisionRepository.save(
                    CvRevision(cv = existing, savedAt = existing.updatedAt, content = mapper.writeValueAsString(before)),
                )
            }
            updated.save()
        }

    /** When the earlier versions of the CV with [code] were saved, latest first. */
    fun findRevisions(code: String): List<CvRevisionSummary> = cvRevisionRepository.findAllByCvCodeOrderBySavedAtDesc(code)

    /**
     * An earlier version of [cv], as the CV it was then (not stored). It is built on the
     * [cv] already loaded, so its person (and photo) is not loaded once more.
     */
    fun findRevision(
        cv: Cv,
        id: UUID,
    ): Cv? =
        cvRevisionRepository
            .findContentByIdAndCvCode(id, cv.code)
            ?.let { revision ->
                mapper
                    .readValue(revision.content, CvSnapshot::class.java)
                    .toForm(cv.person.uuid)
                    .internalize(cv, check = false, person = cv.person)
                    .copy(updatedAt = revision.savedAt)
            }

    /** Makes an earlier version the current one; the current one becomes a revision too. */
    @Transactional
    fun restore(
        code: String,
        id: UUID,
    ): Cv? =
        cvRevisionRepository
            .findByIdAndCvCode(id, code)
            ?.let { revision -> update(code, revision.snapshot().toForm(revision.cv.person.uuid)) }

    @Transactional
    fun deleteByCode(code: String) = cvRepository.deleteByCode(code)

    /**
     * Builds the CV to persist. The names of the CVs of a person are unique (ignoring
     * case); when updating, the CV being updated may of course keep its own name.
     * Experiences are kept newest first, the order in which a CV lists them.
     */
    private fun CvForm.internalize(
        existing: Cv? = null,
        check: Boolean = true,
        person: Person = findPerson(personId),
    ): Cv {
        val name = name.trim()

        if (check) {
            cvRepository
                .findByPersonUuidAndNameIgnoreCase(person.uuid, name)
                ?.takeIf { it.id != existing?.id }
                ?.let { throw CvAlreadyExistsException(person, name) }
        }

        return Cv(
            id = existing?.id ?: 0,
            code = existing?.code ?: UUID.randomUUID().toString(),
            person = person,
            name =
                name.also {
                    if (it.length >
                        Cv.CV_NAME_LENGTH
                    ) {
                        throw CvInvalidInputException("name may be at most ${Cv.CV_NAME_LENGTH} characters")
                    }
                },
            language = language,
            place = place.cleaned("place", MAX_LINE_LENGTH),
            phone = phone.cleaned("phone", MAX_LINE_LENGTH),
            summary = summary.cleaned("summary", Cv.CV_TEXT_LENGTH),
            experiences =
                experiences
                    .mapIndexed { index, it -> it.internalize("experiences[$index]", check) }
                    .sortedWith(NEWEST_FIRST),
            skills = skills.mapIndexed { index, it -> it.internalize("skills[$index]") },
            education = education.cleaned("education", Cv.CV_SECTION_LENGTH),
            subjects = subjects.cleaned("subjects", Cv.CV_SECTION_LENGTH),
            languages = languages.cleaned("languages", Cv.CV_SECTION_LENGTH),
            updatedAt = Instant.now(),
        )
    }

    /** With [check] off (an earlier version), a logo deleted since is kept rather than refused. */
    private fun CvExperienceForm.internalize(
        field: String,
        check: Boolean,
    ): CvExperience {
        if (to != null && to.isBefore(from)) {
            throw CvInvalidInputException("$field.to may not be before $field.from")
        }
        val technologies = technologies.map { it.trim() }.filter { it.isNotEmpty() }.distinct()
        technologies.forEachIndexed { index, it ->
            if (it.length > MAX_TECHNOLOGY_LENGTH) {
                throw CvInvalidInputException("$field.technologies[$index] may be at most $MAX_TECHNOLOGY_LENGTH characters")
            }
        }
        if (technologies.size > MAX_TECHNOLOGIES) {
            throw CvInvalidInputException("$field.technologies may be at most $MAX_TECHNOLOGIES")
        }
        return CvExperience(
            from = from,
            to = to,
            role = role.trim(),
            client = client.trim(),
            employer = employer.cleaned("$field.employer", MAX_LINE_LENGTH),
            technologies = technologies,
            description = description.cleaned("$field.description", Cv.CV_TEXT_LENGTH),
            logoId =
                logoId?.also {
                    if (check &&
                        !logoService.exists(it)
                    ) {
                        throw CvInvalidInputException("$field.logoId is not a known logo")
                    }
                },
        )
    }

    private fun CvSkillForm.internalize(field: String): CvSkill {
        if (level != null && level !in MIN_LEVEL..MAX_LEVEL) {
            throw CvInvalidInputException("$field.level must be between $MIN_LEVEL and $MAX_LEVEL")
        }
        return CvSkill(
            category = category.cleaned("$field.category", MAX_LINE_LENGTH),
            name = name.trim(),
            level = level,
        )
    }

    /** Trims the value, turns blank into null and rejects a value that does not fit its column. */
    private fun String?.cleaned(
        field: String,
        maxLength: Int,
    ): String? =
        this
            ?.trim()
            ?.ifEmpty { null }
            ?.also { if (it.length > maxLength) throw CvInvalidInputException("$field may be at most $maxLength characters") }

    private fun findPerson(personId: UUID): Person =
        personRepository
            .findByUuid(personId)
            .toNullable()
            ?: throw CvPersonNotFoundException(personId)

    private fun Cv.save(): Cv = cvRepository.save(this)

    private fun Cv.snapshot() =
        CvSnapshot(
            name = name,
            language = language,
            place = place,
            phone = phone,
            summary = summary,
            experiences =
                experiences.map {
                    CvSnapshot.Experience(
                        from = it.from.toString(),
                        to = it.to?.toString(),
                        role = it.role,
                        client = it.client,
                        employer = it.employer,
                        technologies = it.technologies,
                        description = it.description,
                        logoId = it.logoId?.toString(),
                    )
                },
            skills = skills.map { CvSnapshot.Skill(category = it.category, name = it.name, level = it.level) },
            education = education,
            subjects = subjects,
            languages = languages,
        )

    private fun CvRevision.snapshot(): CvSnapshot = mapper.readValue(content, CvSnapshot::class.java)

    private fun CvSnapshot.toForm(personId: UUID) =
        CvForm(
            personId = personId,
            name = name,
            language = language,
            place = place,
            phone = phone,
            summary = summary,
            experiences =
                experiences.map {
                    CvExperienceForm(
                        from = YearMonth.parse(it.from),
                        to = it.to?.let(YearMonth::parse),
                        role = it.role,
                        client = it.client,
                        employer = it.employer,
                        technologies = it.technologies,
                        description = it.description,
                        // A logo deleted since is left out
                        logoId = it.logoId?.let(UUID::fromString)?.takeIf(logoService::exists),
                    )
                },
            skills = skills.map { CvSkillForm(category = it.category, name = it.name, level = it.level) },
            education = education,
            subjects = subjects,
            languages = languages,
        )

    /** A copy with another [updatedAt]; [Cv] is no data class since it is an entity. */
    private fun Cv.copy(updatedAt: Instant) =
        Cv(
            id = id,
            code = code,
            person = person,
            name = name,
            language = language,
            place = place,
            phone = phone,
            summary = summary,
            experiences = experiences,
            skills = skills,
            education = education,
            subjects = subjects,
            languages = languages,
            updatedAt = updatedAt,
        )

    companion object {
        private val mapper = jacksonObjectMapper()
        private const val MAX_LINE_LENGTH = 255
        private const val MAX_TECHNOLOGIES = 50
        private const val MAX_TECHNOLOGY_LENGTH = 100
        private const val MIN_LEVEL = 1
        private const val MAX_LEVEL = 5

        /** Latest start first; for the same start month the current one (no end) goes first. */
        private val NEWEST_FIRST =
            compareByDescending<CvExperience> { it.from }
                .thenByDescending { it.to == null }
                .thenByDescending { it.to }
    }
}
