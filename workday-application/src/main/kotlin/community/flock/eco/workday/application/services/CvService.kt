package community.flock.eco.workday.application.services

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
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

/** Like [require], but a violation is a [CvInvalidInputException], which the API reports as a 400. */
private inline fun ensure(
    condition: Boolean,
    message: () -> String,
) {
    if (!condition) throw CvInvalidInputException(message())
}

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
    fun create(form: CvForm): Cv = form.toCv().requireUniqueName().save()

    /** Saves [form] over the CV with [code]; what the CV held before becomes a revision. */
    @Transactional
    fun update(
        code: String,
        form: CvForm,
    ): Cv? =
        findByCode(code)?.let { existing ->
            val updated = form.toCv(existing).requireUniqueName()
            val before = existing.toSnapshot()
            // Saving without changes adds no revision
            if (before != updated.toSnapshot()) {
                cvRevisionRepository.save(
                    CvRevision(cv = existing, savedAt = existing.updatedAt, content = mapper.writeValueAsString(before)),
                )
            }
            updated.save()
        }

    /** The earlier versions of the CV with [code], latest first. */
    fun findRevisions(code: String): List<CvRevision> = cvRevisionRepository.findAllByCvCodeOrderBySavedAtDesc(code)

    /**
     * An earlier version of the CV with [code], as the CV it was then (not stored). Its
     * name is not checked: another CV of the person may have taken it since.
     */
    fun findRevision(
        code: String,
        id: UUID,
    ): Cv? =
        cvRevisionRepository
            .findByIdAndCvCode(id, code)
            ?.let { revision ->
                revision
                    .toSnapshot()
                    .toForm(revision.cv.person.uuid)
                    .toCv(existing = revision.cv, updatedAt = revision.savedAt)
            }

    /** Makes an earlier version the current one; the current one becomes a revision too. */
    @Transactional
    fun restore(
        code: String,
        id: UUID,
    ): Cv? =
        cvRevisionRepository
            .findByIdAndCvCode(id, code)
            ?.let { revision -> update(code, revision.toSnapshot().toForm(revision.cv.person.uuid)) }

    @Transactional
    fun deleteByCode(code: String) = cvRepository.deleteByCode(code)

    /**
     * Builds the CV to persist, over [existing] when updating one. Experiences are kept
     * newest first, the order in which a CV lists them.
     */
    private fun CvForm.toCv(
        existing: Cv? = null,
        updatedAt: Instant = Instant.now(),
    ): Cv =
        Cv(
            id = existing?.id ?: 0,
            code = existing?.code ?: UUID.randomUUID().toString(),
            person = findPerson(personId),
            name = name.trim().limitedTo("name", Cv.NAME_LENGTH),
            language = language,
            place = place.cleaned("place", MAX_LINE_LENGTH),
            phone = phone.cleaned("phone", MAX_LINE_LENGTH),
            summary = summary.cleaned("summary", Cv.TEXT_LENGTH),
            experiences =
                experiences
                    .mapIndexed { index, experience -> experience.toExperience("experiences[$index]") }
                    .sortedWith(NEWEST_FIRST),
            skills = skills.mapIndexed { index, skill -> skill.toSkill("skills[$index]") },
            education = education.cleaned("education", Cv.SECTION_LENGTH),
            subjects = subjects.cleaned("subjects", Cv.SECTION_LENGTH),
            languages = languages.cleaned("languages", Cv.SECTION_LENGTH),
            updatedAt = updatedAt,
        )

    private fun CvExperienceForm.toExperience(field: String): CvExperience {
        ensure(to == null || !to.isBefore(from)) { "$field.to may not be before $field.from" }
        val technologies = technologies.map(String::trim).filter(String::isNotEmpty).distinct()
        technologies.forEachIndexed { index, technology ->
            ensure(technology.length <= MAX_TECHNOLOGY_LENGTH) {
                "$field.technologies[$index] may be at most $MAX_TECHNOLOGY_LENGTH characters"
            }
        }
        ensure(technologies.size <= MAX_TECHNOLOGIES) { "$field.technologies may be at most $MAX_TECHNOLOGIES" }
        return CvExperience(
            from = from,
            to = to,
            role = role.trim(),
            client = client.trim(),
            employer = employer.cleaned("$field.employer", MAX_LINE_LENGTH),
            technologies = technologies,
            description = description.cleaned("$field.description", Cv.TEXT_LENGTH),
            logoId = logoId?.also { ensure(logoService.exists(it)) { "$field.logoId is not a known logo" } },
        )
    }

    private fun CvSkillForm.toSkill(field: String): CvSkill {
        ensure(level == null || level in MIN_LEVEL..MAX_LEVEL) { "$field.level must be between $MIN_LEVEL and $MAX_LEVEL" }
        return CvSkill(
            category = category.cleaned("$field.category", MAX_LINE_LENGTH),
            name = name.trim(),
            level = level,
        )
    }

    /** The names of the CVs of a person are unique, ignoring case; a CV may of course keep its own name. */
    private fun Cv.requireUniqueName(): Cv =
        apply {
            val namesake = cvRepository.findByPersonUuidAndNameIgnoreCase(person.uuid, name)
            if (namesake != null && namesake.id != id) throw CvAlreadyExistsException(person, name)
        }

    /** Trims the value, turns blank into null and rejects a value that does not fit its column. */
    private fun String?.cleaned(
        field: String,
        maxLength: Int,
    ): String? = this?.trim()?.ifEmpty { null }?.limitedTo(field, maxLength)

    private fun String.limitedTo(
        field: String,
        maxLength: Int,
    ): String = also { ensure(length <= maxLength) { "$field may be at most $maxLength characters" } }

    private fun findPerson(personId: UUID): Person =
        personRepository
            .findByUuid(personId)
            .toNullable()
            ?: throw CvPersonNotFoundException(personId)

    private fun Cv.save(): Cv = cvRepository.save(this)

    private fun Cv.toSnapshot() =
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

    private fun CvRevision.toSnapshot(): CvSnapshot = mapper.readValue(content)

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
