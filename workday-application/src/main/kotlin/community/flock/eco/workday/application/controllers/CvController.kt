package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteCv
import community.flock.eco.workday.api.endpoint.GetCvAll
import community.flock.eco.workday.api.endpoint.GetCvByCode
import community.flock.eco.workday.api.endpoint.GetCvRevision
import community.flock.eco.workday.api.endpoint.GetCvRevisions
import community.flock.eco.workday.api.endpoint.GetCvSync
import community.flock.eco.workday.api.endpoint.PostCv
import community.flock.eco.workday.api.endpoint.PostCvBase
import community.flock.eco.workday.api.endpoint.PostCvRevisionRestore
import community.flock.eco.workday.api.endpoint.PostCvSync
import community.flock.eco.workday.api.endpoint.PutCv
import community.flock.eco.workday.api.model.Error
import community.flock.eco.workday.application.authorities.CvAuthority
import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.forms.CvForm
import community.flock.eco.workday.application.forms.CvSkillForm
import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.repository.CvRevisionSummary
import community.flock.eco.workday.application.services.CvConflictException
import community.flock.eco.workday.application.services.CvInvalidInputException
import community.flock.eco.workday.application.services.CvService
import community.flock.eco.workday.application.services.CvSync
import community.flock.eco.workday.application.services.CvSyncAction
import community.flock.eco.workday.application.services.CvValidationException
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.application.services.photoDataUrl
import community.flock.eco.workday.application.utils.parseSort
import community.flock.wirespec.kotlin.Wirespec
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.YearMonth
import java.util.UUID
import community.flock.eco.workday.api.model.Cv as CvApi
import community.flock.eco.workday.api.model.CvExperience as CvExperienceApi
import community.flock.eco.workday.api.model.CvExperienceForm as CvExperienceFormApi
import community.flock.eco.workday.api.model.CvForm as CvFormApi
import community.flock.eco.workday.api.model.CvLanguage as CvLanguageApi
import community.flock.eco.workday.api.model.CvRevision as CvRevisionApi
import community.flock.eco.workday.api.model.CvSkill as CvSkillApi
import community.flock.eco.workday.api.model.CvSync as CvSyncApi
import community.flock.eco.workday.api.model.CvSyncAction as CvSyncActionApi
import community.flock.eco.workday.api.model.CvSyncItem as CvSyncItemApi
import community.flock.eco.workday.api.model.CvSyncKind as CvSyncKindApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.application.model.Person as PersonInternal

/**
 * CVs. [CvAuthority.READ] lets you read your own CVs and [CvAuthority.WRITE] write
 * them; [CvAuthority.ADMIN] reads and writes the CVs of everybody. A CV you may not
 * use is reported as not found, so its existence does not leak. Whoever may write a
 * CV may make it the base in its language.
 */
@RestController
class CvController(
    private val cvService: CvService,
    private val personService: PersonService,
) : GetCvAll.Handler,
    GetCvByCode.Handler,
    PostCv.Handler,
    PutCv.Handler,
    DeleteCv.Handler,
    GetCvRevisions.Handler,
    GetCvRevision.Handler,
    PostCvRevisionRestore.Handler,
    PostCvBase.Handler,
    GetCvSync.Handler,
    PostCvSync.Handler {
    @PreAuthorize("hasAnyAuthority('CvAuthority.READ', 'CvAuthority.ADMIN')")
    override suspend fun getCvAll(request: GetCvAll.Request): GetCvAll.Response<*> {
        val auth = authentication()
        val q = request.queries
        val pageable = q.toPageable()
        val page =
            when {
                auth.isAdmin() ->
                    when (val personId = q.personId) {
                        null -> cvService.findAll(pageable)
                        else -> cvService.findAllByPersonUuid(personId.toUuidOrBadRequest("personId"), pageable)
                    }
                else -> cvService.findAllByPersonUuid(auth.ownPersonUuid(), pageable)
            }
        return GetCvAll.Response200(
            body = page.content.map { it.externalize() },
            xtotal = page.totalElements.toInt(),
        )
    }

    @PreAuthorize("hasAnyAuthority('CvAuthority.READ', 'CvAuthority.ADMIN')")
    override suspend fun getCvByCode(request: GetCvByCode.Request): GetCvByCode.Response<*> =
        findReadable(request.path.code)
            ?.let { GetCvByCode.Response200(it.externalize()) }
            ?: GetCvByCode.Response404(Error("CV not found"))

    @PreAuthorize("hasAnyAuthority('CvAuthority.WRITE', 'CvAuthority.ADMIN')")
    override suspend fun postCv(request: PostCv.Request): PostCv.Response<*> =
        validated(
            onConflict = { PostCv.Response409(it) },
            onBadRequest = { PostCv.Response400(it) },
        ) {
            val created = cvService.create(request.body.internalize())
            PostCv.Response200(created.externalize())
        }

    @PreAuthorize("hasAnyAuthority('CvAuthority.WRITE', 'CvAuthority.ADMIN')")
    override suspend fun putCv(request: PutCv.Request): PutCv.Response<*> =
        validated(
            onConflict = { PutCv.Response409(it) },
            onBadRequest = { PutCv.Response400(it) },
        ) {
            findWritable(request.path.code)
                ?.let { cvService.update(it.code, request.body.internalize()) }
                ?.let { PutCv.Response200(it.externalize()) }
                ?: PutCv.Response404(Error("CV not found"))
        }

    @PreAuthorize("hasAnyAuthority('CvAuthority.WRITE', 'CvAuthority.ADMIN')")
    override suspend fun deleteCv(request: DeleteCv.Request): DeleteCv.Response<*> =
        try {
            findWritable(request.path.code)
                ?.let {
                    cvService.deleteByCode(it.code)
                    DeleteCv.Response204(Unit)
                }
                ?: DeleteCv.Response404(Error("CV not found"))
        } catch (e: CvConflictException) {
            DeleteCv.Response409(Error(e.message))
        }

    /** Whoever may write the CV may make it the base. */
    @PreAuthorize("hasAnyAuthority('CvAuthority.WRITE', 'CvAuthority.ADMIN')")
    override suspend fun postCvBase(request: PostCvBase.Request): PostCvBase.Response<*> =
        findWritable(request.path.code)
            ?.let { cvService.makeBase(it.code) }
            ?.let { PostCvBase.Response200(it.externalize()) }
            ?: PostCvBase.Response404(Error("CV not found"))

    @PreAuthorize("hasAnyAuthority('CvAuthority.READ', 'CvAuthority.ADMIN')")
    override suspend fun getCvRevisions(request: GetCvRevisions.Request): GetCvRevisions.Response<*> =
        findReadable(request.path.code)
            ?.let { cv -> GetCvRevisions.Response200(cvService.findRevisions(cv.code).map { it.externalize() }) }
            ?: GetCvRevisions.Response404(Error("CV not found"))

    @PreAuthorize("hasAnyAuthority('CvAuthority.READ', 'CvAuthority.ADMIN')")
    override suspend fun getCvRevision(request: GetCvRevision.Request): GetCvRevision.Response<*> =
        findReadable(request.path.code)
            ?.let { cv ->
                request.path.id
                    .toUuidOrNull()
                    ?.let { cvService.findRevision(cv, it) }
            }?.let { GetCvRevision.Response200(it.externalize()) }
            ?: GetCvRevision.Response404(Error("Version not found"))

    /** Makes an earlier version the current one; the name it had may be taken by now (409). */
    @PreAuthorize("hasAnyAuthority('CvAuthority.WRITE', 'CvAuthority.ADMIN')")
    override suspend fun postCvRevisionRestore(request: PostCvRevisionRestore.Request): PostCvRevisionRestore.Response<*> =
        try {
            findWritable(request.path.code)
                ?.let { cv ->
                    request.path.id
                        .toUuidOrNull()
                        ?.let { cvService.restore(cv.code, it) }
                }?.let { PostCvRevisionRestore.Response200(it.externalize()) }
                ?: PostCvRevisionRestore.Response404(Error("Version not found"))
        } catch (e: CvConflictException) {
            PostCvRevisionRestore.Response409(Error(e.message))
        }

    /** How a copy stands against its base; a CV that is no copy has none (404). */
    @PreAuthorize("hasAnyAuthority('CvAuthority.READ', 'CvAuthority.ADMIN')")
    override suspend fun getCvSync(request: GetCvSync.Request): GetCvSync.Response<*> =
        findReadable(request.path.code)
            ?.let { cv -> cvService.syncStatus(cv)?.let { it.externalize(cv.basedOn?.code.orEmpty()) } }
            ?.let { GetCvSync.Response200(it) }
            ?: GetCvSync.Response404(Error("Not a copy of a base CV"))

    /** Takes the base's version of a field of a copy, keeps the copy's, or puts it in the base. */
    @PreAuthorize("hasAnyAuthority('CvAuthority.WRITE', 'CvAuthority.ADMIN')")
    override suspend fun postCvSync(request: PostCvSync.Request): PostCvSync.Response<*> =
        try {
            findWritable(request.path.code)
                ?.let { cvService.sync(it.code, request.body.address, request.body.action.internalize()) }
                ?.let { PostCvSync.Response200(it.externalize()) }
                ?: PostCvSync.Response404(Error("CV not found"))
        } catch (e: CvValidationException) {
            PostCvSync.Response400(Error(e.message))
        }

    /** The CV with [code], when the current user may read it: any for an admin, else their own with READ. */
    private fun findReadable(code: String): Cv? {
        val auth = authentication()
        return cvService
            .findByCode(code)
            ?.takeIf { auth.isAdmin() || (auth.has(CvAuthority.READ) && auth.isAssociatedWith(it.person)) }
    }

    /** The CV with [code], when the current user may write it: any for an admin, else their own with WRITE. */
    private fun findWritable(code: String): Cv? {
        val auth = authentication()
        return cvService
            .findByCode(code)
            ?.takeIf { auth.isAdmin() || (auth.has(CvAuthority.WRITE) && auth.isAssociatedWith(it.person)) }
    }

    /**
     * Runs [block] and turns the validation failures of the CV service into the typed
     * error responses of the contract: a clash with the other CVs of the person (a name
     * taken, a base with copies) is a 409, anything else wrong with the input is a 400.
     */
    private inline fun <R> validated(
        onConflict: (Error) -> R,
        onBadRequest: (Error) -> R,
        block: () -> R,
    ): R =
        try {
            block()
        } catch (e: CvConflictException) {
            onConflict(Error(e.message))
        } catch (e: CvValidationException) {
            onBadRequest(Error(e.message))
        }

    private fun Cv.externalize() =
        CvApi(
            id = id,
            code = code,
            name = name,
            language = language.externalize(),
            place = place,
            phone = phone,
            summary = summary,
            experiences = experiences.map { it.externalize() },
            skills = skills.map { CvSkillApi(id = it.itemId.toString(), category = it.category, name = it.name, level = it.level) },
            education = education,
            subjects = subjects,
            languages = languages,
            updatedAt = updatedAt.toString(),
            person = person.externalize(),
            base = base,
            basedOn = basedOn?.code,
            basedOnUpdatedAt = basedOnUpdatedAt?.toString(),
        )

    private fun CvExperience.externalize() =
        CvExperienceApi(
            id = itemId.toString(),
            from = from.toString(),
            to = to?.toString(),
            role = role,
            client = client,
            employer = employer,
            technologies = technologies,
            description = description,
            logoId = logoId?.toString(),
        )

    private fun CvSync.Status.externalize(base: String) =
        CvSyncApi(base = base, offers = offers.map { it.externalize() }, tailored = tailored.map { it.externalize() })

    private fun CvSync.Item.externalize() =
        CvSyncItemApi(
            address = address,
            label = label,
            kind = CvSyncKindApi.valueOf(kind.name),
            base = base,
            copy = copy,
            outdated = outdated,
        )

    private fun CvSyncActionApi.internalize() = CvSyncAction.valueOf(name)

    private fun CvLanguage.externalize() =
        when (this) {
            CvLanguage.NL -> CvLanguageApi.NL
            CvLanguage.EN -> CvLanguageApi.EN
        }

    private fun CvLanguageApi.internalize() =
        when (this) {
            CvLanguageApi.NL -> CvLanguage.NL
            CvLanguageApi.EN -> CvLanguage.EN
        }

    /** The CV shows name, e-mail and date of birth of the person, so those are included. */
    private fun PersonInternal.externalize() =
        PersonApi(
            id = id,
            uuid = uuid.toString(),
            firstname = firstname,
            lastname = lastname,
            email = email,
            position = position,
            number = number,
            birthdate = birthdate?.toString(),
            joinDate = joinDate?.toString(),
            active = active,
            lastActiveAt = lastActiveAt?.toString(),
            reminders = reminders,
            receiveEmail = receiveEmail,
            shoeSize = shoeSize,
            shirtSize = shirtSize,
            googleDriveId = googleDriveId,
            address = null,
            user = null,
            fullName = "$firstname $lastname",
            photo = photoDataUrl(),
        )

    /**
     * The contract (cvs.ws) states which fields are required and what their values look
     * like; the refined types are checked here. An admin may write the CV of any person
     * (their own when no person is given); everybody else always writes their own.
     */
    private fun CvFormApi.internalize(): CvForm {
        val auth = authentication()
        val personUuid =
            when {
                auth.isAdmin() -> personId?.validated("personId")?.value?.let(UUID::fromString) ?: auth.ownPersonUuid()
                else -> auth.ownPersonUuid()
            }
        return CvForm(
            personId = personUuid,
            name = name.validated("name").value.trim(),
            language = language.internalize(),
            place = place,
            phone = phone,
            summary = summary,
            experiences = experiences.orEmpty().mapIndexed { index, it -> it.internalize("experiences[$index]") },
            skills =
                skills.orEmpty().mapIndexed { index, it ->
                    CvSkillForm(
                        id = it.id?.validated("skills[$index].id")?.value?.let(UUID::fromString),
                        category = it.category,
                        name = it.name.validated("skills[$index].name").value,
                        level = it.level,
                    )
                },
            education = education,
            subjects = subjects,
            languages = languages,
            basedOn = basedOn?.trim()?.ifEmpty { null },
        )
    }

    private fun CvExperienceFormApi.internalize(field: String) =
        CvExperienceForm(
            id = id?.validated("$field.id")?.value?.let(UUID::fromString),
            from = YearMonth.parse(from.validated("$field.from").value),
            to = to?.validated("$field.to")?.value?.let(YearMonth::parse),
            role = role.validated("$field.role").value.trim(),
            client = client.validated("$field.client").value.trim(),
            employer = employer,
            technologies = technologies.orEmpty(),
            description = description,
            logoId = logoId?.validated("$field.logoId")?.value?.let(UUID::fromString),
        )

    /** Applies the refined type's pattern from the contract; a violation is a 400 with the field name. */
    private fun <T : Wirespec.Refined<String>> T.validated(field: String): T =
        when {
            validate() -> this
            value.isBlank() -> throw CvInvalidInputException("$field is required")
            else -> throw CvInvalidInputException("$field is invalid")
        }

    /** The person behind the current user; writing or listing your own CVs takes one. */
    private fun Authentication.ownPersonUuid(): UUID =
        personService.findByUserCode(name)?.uuid
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not linked to a person")

    private fun Authentication.has(authority: CvAuthority): Boolean = authorities.any { it.authority == authority.toName() }

    private fun Authentication.isAdmin(): Boolean = has(CvAuthority.ADMIN)

    private fun CvRevisionSummary.externalize() = CvRevisionApi(id = id.toString(), savedAt = savedAt.toString())

    private fun String.toUuidOrNull(): UUID? = runCatching { UUID.fromString(trim()) }.getOrNull()

    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    private fun GetCvAll.Queries.toPageable(): Pageable = PageRequest.of(page ?: 0, size ?: 20, parseSort(sort?.split(",")))

    private fun String.toUuidOrBadRequest(field: String): UUID =
        runCatching { UUID.fromString(trim()) }
            .getOrElse { throw ResponseStatusException(HttpStatus.BAD_REQUEST, "$field must be a UUID") }
}
