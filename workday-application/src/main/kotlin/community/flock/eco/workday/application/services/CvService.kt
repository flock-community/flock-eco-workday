package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.forms.CvForm
import community.flock.eco.workday.application.forms.CvSkillForm
import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.model.CvSkill
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.CvRepository
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.Instant
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
    language: CvLanguage,
) : CvValidationException("${person.getFullName()} already has a $language CV")

@Service
class CvService(
    private val cvRepository: CvRepository,
    private val personRepository: PersonRepository,
) {
    fun findAll(pageable: Pageable): Page<Cv> = cvRepository.findAll(pageable)

    fun findAllByPersonUuid(
        personUuid: UUID,
        pageable: Pageable,
    ): Page<Cv> = cvRepository.findAllByPersonUuid(personUuid, pageable)

    fun findByCode(code: String): Cv? = cvRepository.findByCode(code)

    @Transactional
    fun create(form: CvForm): Cv = form.internalize().save()

    @Transactional
    fun update(
        code: String,
        form: CvForm,
    ): Cv? = findByCode(code)?.let { form.internalize(it).save() }

    @Transactional
    fun deleteByCode(code: String) = cvRepository.deleteByCode(code)

    /**
     * Builds the CV to persist. A person has one CV per language; when updating, the
     * CV being updated may of course keep its own person and language. Experiences are
     * kept newest first, the order in which a CV lists them.
     */
    private fun CvForm.internalize(existing: Cv? = null): Cv {
        val person = findPerson(personId)

        cvRepository
            .findByPersonUuidAndLanguage(person.uuid, language)
            ?.takeIf { it.id != existing?.id }
            ?.let { throw CvAlreadyExistsException(person, language) }

        return Cv(
            id = existing?.id ?: 0,
            code = existing?.code ?: UUID.randomUUID().toString(),
            person = person,
            language = language,
            place = place.cleaned("place", MAX_LINE_LENGTH),
            phone = phone.cleaned("phone", MAX_LINE_LENGTH),
            summary = summary.cleaned("summary", Cv.CV_TEXT_LENGTH),
            experiences =
                experiences
                    .mapIndexed { index, it -> it.internalize("experiences[$index]") }
                    .sortedWith(NEWEST_FIRST),
            skills = skills.mapIndexed { index, it -> it.internalize("skills[$index]") },
            education = education.cleaned("education", Cv.CV_SECTION_LENGTH),
            subjects = subjects.cleaned("subjects", Cv.CV_SECTION_LENGTH),
            languages = languages.cleaned("languages", Cv.CV_SECTION_LENGTH),
            updatedAt = Instant.now(),
        )
    }

    private fun CvExperienceForm.internalize(field: String): CvExperience {
        if (to != null && to.isBefore(from)) {
            throw CvInvalidInputException("$field.to may not be before $field.from")
        }
        val technologies = technologies.map { it.trim() }.filter { it.isNotEmpty() }.distinct()
        technologies.forEachIndexed { index, it ->
            if (it.length > MAX_TECHNOLOGY_LENGTH) {
                throw CvInvalidInputException("$field.technologies[$index] may be at most $MAX_TECHNOLOGY_LENGTH characters")
            }
        }
        // Stored as a JSON array in a column of MAX_TECHNOLOGIES_LENGTH
        if (technologies.sumOf { it.length + JSON_OVERHEAD } > MAX_TECHNOLOGIES_LENGTH) {
            throw CvInvalidInputException("$field.technologies are too many to store")
        }
        return CvExperience(
            from = from,
            to = to,
            role = role.trim(),
            client = client.trim(),
            employer = employer.cleaned("$field.employer", MAX_LINE_LENGTH),
            technologies = technologies,
            description = description.cleaned("$field.description", Cv.CV_TEXT_LENGTH),
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

    companion object {
        private const val MAX_LINE_LENGTH = 255
        private const val MAX_TECHNOLOGIES_LENGTH = 1000
        private const val MAX_TECHNOLOGY_LENGTH = 100

        /** Quotes and separator around every technology in the JSON array. */
        private const val JSON_OVERHEAD = 4
        private const val MIN_LEVEL = 1
        private const val MAX_LEVEL = 5

        /** Latest start first; for the same start month the current one (no end) goes first. */
        private val NEWEST_FIRST =
            compareByDescending<CvExperience> { it.from }
                .thenByDescending { it.to == null }
                .thenByDescending { it.to }
    }
}
