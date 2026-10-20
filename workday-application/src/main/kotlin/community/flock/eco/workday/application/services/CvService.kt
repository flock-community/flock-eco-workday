package community.flock.eco.workday.application.services

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.forms.CvForm
import community.flock.eco.workday.application.forms.CvSkillForm
import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
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

/** The CV cannot be saved or deleted as asked because of the other CVs of the person. */
open class CvConflictException(
    message: String,
) : CvValidationException(message)

class CvAlreadyExistsException(
    person: Person,
    name: String,
) : CvConflictException("${person.getFullName()} already has a CV named '$name'")

/** What a copy does with a field at sync: see [CvService.sync]. */
enum class CvSyncAction {
    ACCEPT,
    SKIP,
    PROMOTE,
}

class CvBaseHasCopiesException(
    cv: Cv,
    action: String,
) : CvConflictException("'${cv.name}' is the base of other CVs; make one of those the base before $action")

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

    /**
     * A new CV is a copy of the base it names ([CvForm.basedOn]). Without one it becomes a
     * copy of the base in its language, or the base itself when it is the first CV of the
     * person in that language.
     */
    @Transactional
    fun create(form: CvForm): Cv {
        val person = findPerson(form.personId)
        val link = form.basedOn?.let { copyOf(it, person, form.language) } ?: placeIn(person, form.language)
        return form.internalize(person = person, link = link).save()
    }

    /**
     * Saves [form] over the CV with [code]; what the CV held before becomes a revision.
     * Saving a base brings its copies along (see [CvSync]).
     */
    @Transactional
    fun update(
        code: String,
        form: CvForm,
    ): Cv? =
        findByCode(code)?.let { existing ->
            existing.saveOver(form.internalize(existing, link = existing.linkFor(form.language)))
        }

    /**
     * How the copy [cv] stands against its base: the changes of the base to look at, and
     * the fields it tailored. Null when [cv] is no copy.
     */
    fun syncStatus(cv: Cv): CvSync.Status? =
        cv.basedOn?.let { base ->
            val now = base.snapshot()
            CvSync.status(cv.snapshot(), cv.agreedSnapshot() ?: now, now)
        }

    /**
     * Acts on the field at [address] of the copy with [code]: [CvSyncAction.ACCEPT] takes
     * the base's version (also: back to the base for a tailored field),
     * [CvSyncAction.SKIP] keeps the copy's version and [CvSyncAction.PROMOTE] puts the
     * copy's version in the base, which then brings its copies along.
     */
    @Transactional
    fun sync(
        code: String,
        address: String,
        action: CvSyncAction,
    ): Cv? =
        findByCode(code)?.let { copy ->
            val base = copy.basedOn ?: throw CvInvalidInputException("'${copy.name}' is not a copy of a base CV")
            val c = copy.snapshot()
            val n = base.snapshot()
            val r = copy.agreedSnapshot() ?: n
            try {
                when (action) {
                    CvSyncAction.ACCEPT -> CvSync.accept(c, r, n, address).let { copy.store(it.copy, it.agreed) }
                    CvSyncAction.SKIP -> CvSync.skip(c, r, n, address).let { copy.store(it.copy, it.agreed) }
                    CvSyncAction.PROMOTE -> base.store(CvSync.promote(c, n, address), null)
                }
            } catch (e: IllegalArgumentException) {
                throw CvInvalidInputException(e.message ?: "Unknown field $address")
            }
            findByCode(code)
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

    /**
     * Makes the CV with [code] the base in its language: the base before it and the
     * copies of that become copies of this one.
     */
    @Transactional
    fun makeBase(code: String): Cv? =
        findByCode(code)?.let { cv ->
            if (!cv.base) {
                val base = cv.snapshot()
                val agreed = mapper.writeValueAsString(base)
                // Others first: two bases in a language would break the unique constraint.
                // Their assignments and skills take the ids of the same ones in the base, and
                // what they share with the base from now on follows it.
                cvRepository
                    .findAllByPersonUuidAndLanguage(cv.person.uuid, cv.language)
                    .filter { it.id != cv.id }
                    .forEach { other ->
                        val link = CvLink(basedOn = cv, baseSnapshot = agreed)
                        val aligned = other.snapshot().alignedTo(base)
                        cvRepository.saveAndFlush(
                            aligned.toForm(other.person.uuid).internalize(other, check = false, person = other.person, link = link),
                        )
                    }
                cvRepository.makeBase(cv.id)
            }
            findByCode(code)
        }

    /** A base cannot be deleted while there are copies of it; make another CV the base first. */
    @Transactional
    fun deleteByCode(code: String) {
        findByCode(code)
            ?.takeIf { it.base && cvRepository.existsByBasedOn(it) }
            ?.let { throw CvBaseHasCopiesException(it, "deleting it") }
        cvRepository.deleteByCode(code)
    }

    /** A copy of the base with [code], as it was saved last: always of the base, never of a copy. */
    private fun copyOf(
        code: String,
        person: Person,
        language: CvLanguage,
    ): CvLink {
        val base =
            cvRepository
                .findByCode(code)
                ?.takeIf { it.person.id == person.id }
                ?: throw CvInvalidInputException("basedOn is not a CV of ${person.getFullName()}")
        if (!base.base) throw CvInvalidInputException("basedOn is not a base CV; a copy is always made of the base")
        if (base.language != language) throw CvInvalidInputException("A copy of a base CV is in its language (${base.language})")
        return base.linkOfCopy(basedOnUpdatedAt = base.updatedAt)
    }

    /** A copy of this base, agreeing with the base as it is now. */
    private fun Cv.linkOfCopy(basedOnUpdatedAt: Instant? = null) =
        CvLink(basedOn = this, basedOnUpdatedAt = basedOnUpdatedAt, baseSnapshot = mapper.writeValueAsString(snapshot()))

    /**
     * Where a CV in [language] belongs without a base to copy: a copy of the base in that
     * language, the base itself when the person has no CV in it yet, or neither when there
     * are CVs in it from before bases existed and an admin still has to pick one.
     */
    private fun placeIn(
        person: Person,
        language: CvLanguage,
    ): CvLink =
        cvRepository.findByPersonUuidAndLanguageAndBase(person.uuid, language, true)?.linkOfCopy()
            ?: if (cvRepository.existsByPersonUuidAndLanguage(person.uuid, language)) CvLink.NONE else CvLink(base = true)

    /**
     * The link of this CV once it is saved in [language]. A copy keeps the language of its
     * base, and a base with copies keeps its language too; a CV on its own may move.
     */
    private fun Cv.linkFor(language: CvLanguage): CvLink {
        val copyOf = basedOn
        return when {
            language == this.language -> link()
            copyOf != null -> throw CvInvalidInputException("A copy of a base CV is in its language (${copyOf.language})")
            base && cvRepository.existsByBasedOn(this) -> throw CvBaseHasCopiesException(this, "changing its language")
            else -> placeIn(person, language)
        }
    }

    private fun Cv.link() = CvLink(base = base, basedOn = basedOn, basedOnUpdatedAt = basedOnUpdatedAt, baseSnapshot = baseSnapshot)

    private fun Cv.agreedSnapshot(): CvSnapshot? = baseSnapshot?.let { mapper.readValue(it, CvSnapshot::class.java) }

    /** Saves [updated] over this CV, keeping what it held as a revision; a base brings its copies along. */
    private fun Cv.saveOver(updated: Cv): Cv {
        val before = snapshot()
        // Saving without changes adds no revision
        if (before != updated.snapshot()) {
            cvRevisionRepository.save(CvRevision(cv = this, savedAt = updatedAt, content = mapper.writeValueAsString(before)))
        }
        return updated.save().also { if (it.base) it.bringCopiesAlong() }
    }

    /** Saves [content] over this CV; for a copy [agreed] is what it agrees with the base from now on. */
    private fun Cv.store(
        content: CvSnapshot,
        agreed: CvSnapshot?,
    ): Cv {
        val link = link().copy(baseSnapshot = agreed?.let(mapper::writeValueAsString) ?: baseSnapshot)
        return saveOver(content.toForm(person.uuid).internalize(this, check = false, person = person, link = link))
    }

    /** The copies of this base take over the facts it changed (see [CvSync.reconcile]). */
    private fun Cv.bringCopiesAlong() {
        val now = snapshot()
        cvRepository.findAllByBasedOn(this).forEach { copy ->
            val result = CvSync.reconcile(copy.snapshot(), copy.agreedSnapshot() ?: now, now)
            copy.store(result.copy, result.agreed)
        }
    }

    /** Whether a CV is the base, or else which base it is a copy of, since when and agreeing on what. */
    private data class CvLink(
        val base: Boolean = false,
        val basedOn: Cv? = null,
        val basedOnUpdatedAt: Instant? = null,
        val baseSnapshot: String? = null,
    ) {
        companion object {
            val NONE = CvLink()
        }
    }

    /**
     * Builds the CV to persist. The names of the CVs of a person are unique (ignoring
     * case); when updating, the CV being updated may of course keep its own name.
     * Experiences are kept newest first, the order in which a CV lists them.
     */
    private fun CvForm.internalize(
        existing: Cv? = null,
        check: Boolean = true,
        person: Person = findPerson(personId),
        link: CvLink = existing?.link() ?: CvLink.NONE,
    ): Cv {
        val name = name.trim()

        if (check) {
            cvRepository
                .findByPersonUuidAndNameIgnoreCase(person.uuid, name)
                ?.takeIf { it.id != existing?.id }
                ?.let { throw CvAlreadyExistsException(person, name) }
        }

        val known = listOfNotNull(existing, link.basedOn)
        val experienceIds =
            assignIds(experiences, known.flatMap { it.experiences }, { it.id }, { it.itemId }) { form, item ->
                item.from == form.from && item.client.equals(form.client.trim(), ignoreCase = true)
            }
        val skillIds =
            assignIds(skills, known.flatMap { it.skills }, { it.id }, { it.itemId }) { form, item ->
                item.name.equals(form.name.trim(), ignoreCase = true) &&
                    (item.category ?: "").equals(form.category?.trim() ?: "", ignoreCase = true)
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
                    .mapIndexed { index, it -> it.internalize("experiences[$index]", check, experienceIds[index]) }
                    .sortedWith(NEWEST_FIRST),
            skills = skills.mapIndexed { index, it -> it.internalize("skills[$index]", skillIds[index]) },
            education = education.cleaned("education", Cv.CV_SECTION_LENGTH),
            subjects = subjects.cleaned("subjects", Cv.CV_SECTION_LENGTH),
            languages = languages.cleaned("languages", Cv.CV_SECTION_LENGTH),
            updatedAt = Instant.now(),
            base = link.base,
            basedOn = link.basedOn,
            basedOnUpdatedAt = link.basedOnUpdatedAt,
            baseSnapshot = link.baseSnapshot.takeIf { link.basedOn != null },
        )
    }

    /**
     * The item id of each of [forms]: the id it brings when no other form claims it
     * first, else the id of a [known] item like it (of the CV itself, or the base of a
     * copy) not taken yet, else a new one.
     */
    private fun <F, I> assignIds(
        forms: List<F>,
        known: List<I>,
        formId: (F) -> UUID?,
        knownId: (I) -> UUID,
        alike: (F, I) -> Boolean,
    ): List<UUID> {
        val used = mutableSetOf<UUID>()
        val claimed = forms.map { form -> formId(form)?.takeIf { used.add(it) } }
        return forms.mapIndexed { index, form ->
            claimed[index]
                ?: known
                    .firstOrNull { item -> knownId(item) !in used && alike(form, item) }
                    ?.let(knownId)
                    ?.also { used += it }
                ?: UUID.randomUUID().also { used += it }
        }
    }

    /** Gives the assignments and skills of this CV the ids of the same ones in [base], where they have no such id yet. */
    private fun CvSnapshot.alignedTo(base: CvSnapshot): CvSnapshot {
        val experienceIds = base.experiences.mapNotNull { it.id }.toSet()
        val skillIds = base.skills.mapNotNull { it.id }.toSet()
        val used =
            (experiences.mapNotNull { it.id } + skills.mapNotNull { it.id })
                .filter { it in experienceIds || it in skillIds }
                .toMutableSet()
        return copy(
            experiences =
                experiences.map { e ->
                    if (e.id in experienceIds) {
                        e
                    } else {
                        base.experiences
                            .firstOrNull { it.id !in used && it.from == e.from && it.client.equals(e.client, ignoreCase = true) }
                            ?.let { match -> e.copy(id = match.id).also { used += match.id!! } }
                            ?: e
                    }
                },
            skills =
                skills.map { sk ->
                    if (sk.id in skillIds) {
                        sk
                    } else {
                        base.skills
                            .firstOrNull {
                                it.id !in used && it.name.equals(sk.name, ignoreCase = true) &&
                                    (it.category ?: "").equals(sk.category ?: "", ignoreCase = true)
                            }?.let { match -> sk.copy(id = match.id).also { used += match.id!! } }
                            ?: sk
                    }
                },
        )
    }

    /** With [check] off (an earlier version), a logo deleted since is kept rather than refused. */
    private fun CvExperienceForm.internalize(
        field: String,
        check: Boolean,
        itemId: UUID,
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
            itemId = itemId,
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

    private fun CvSkillForm.internalize(
        field: String,
        itemId: UUID,
    ): CvSkill {
        if (level != null && level !in MIN_LEVEL..MAX_LEVEL) {
            throw CvInvalidInputException("$field.level must be between $MIN_LEVEL and $MAX_LEVEL")
        }
        return CvSkill(
            itemId = itemId,
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
                        id = it.itemId.toString(),
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
            skills = skills.map { CvSnapshot.Skill(id = it.itemId.toString(), category = it.category, name = it.name, level = it.level) },
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
                        id = it.id?.toUuidOrNull(),
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
            skills = skills.map { CvSkillForm(id = it.id?.toUuidOrNull(), category = it.category, name = it.name, level = it.level) },
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
            base = base,
            basedOn = basedOn,
            basedOnUpdatedAt = basedOnUpdatedAt,
            baseSnapshot = baseSnapshot,
        )

    private fun String.toUuidOrNull(): UUID? = runCatching { UUID.fromString(this) }.getOrNull()

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
