package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteCv
import community.flock.eco.workday.api.endpoint.GetCvAll
import community.flock.eco.workday.api.endpoint.GetCvByCode
import community.flock.eco.workday.api.endpoint.PostCv
import community.flock.eco.workday.api.endpoint.PostCvImport
import community.flock.eco.workday.api.endpoint.PutCv
import community.flock.eco.workday.api.model.Error
import community.flock.eco.workday.application.authorities.CvAuthority
import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.forms.CvForm
import community.flock.eco.workday.application.forms.CvSkillForm
import community.flock.eco.workday.application.model.Cv
import community.flock.eco.workday.application.model.CvExperience
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.services.CvImportException
import community.flock.eco.workday.application.services.CvImportService
import community.flock.eco.workday.application.services.CvInvalidInputException
import community.flock.eco.workday.application.services.CvAlreadyExistsException
import community.flock.eco.workday.application.services.CvService
import community.flock.eco.workday.application.services.CvValidationException
import community.flock.eco.workday.application.services.PersonService
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
import java.util.Base64
import java.util.UUID
import community.flock.eco.workday.api.model.Cv as CvApi
import community.flock.eco.workday.api.model.CvExperience as CvExperienceApi
import community.flock.eco.workday.api.model.CvExperienceForm as CvExperienceFormApi
import community.flock.eco.workday.api.model.CvForm as CvFormApi
import community.flock.eco.workday.api.model.CvImport as CvImportApi
import community.flock.eco.workday.api.model.CvLanguage as CvLanguageApi
import community.flock.eco.workday.api.model.CvSkill as CvSkillApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.application.model.Person as PersonInternal

/**
 * CVs. Everybody with [CvAuthority.READ] / [CvAuthority.WRITE] maintains their own CVs;
 * with [CvAuthority.ADMIN] you see and maintain the CVs of everybody. A CV of somebody
 * else is reported as not found, so its existence does not leak.
 */
@RestController
class CvController(
    private val cvService: CvService,
    private val cvImportService: CvImportService,
    private val personService: PersonService,
) : GetCvAll.Handler,
    GetCvByCode.Handler,
    PostCv.Handler,
    PutCv.Handler,
    DeleteCv.Handler,
    PostCvImport.Handler {
    @PreAuthorize("hasAuthority('CvAuthority.READ')")
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

    @PreAuthorize("hasAuthority('CvAuthority.READ')")
    override suspend fun getCvByCode(request: GetCvByCode.Request): GetCvByCode.Response<*> =
        findAccessible(request.path.code)
            ?.let { GetCvByCode.Response200(it.externalize()) }
            ?: GetCvByCode.Response404(Error("CV not found"))

    @PreAuthorize("hasAuthority('CvAuthority.WRITE')")
    override suspend fun postCv(request: PostCv.Request): PostCv.Response<*> =
        validated(
            onConflict = { PostCv.Response409(it) },
            onBadRequest = { PostCv.Response400(it) },
        ) {
            val created = cvService.create(request.body.internalize())
            PostCv.Response200(created.externalize())
        }

    @PreAuthorize("hasAuthority('CvAuthority.WRITE')")
    override suspend fun putCv(request: PutCv.Request): PutCv.Response<*> =
        validated(
            onConflict = { PutCv.Response409(it) },
            onBadRequest = { PutCv.Response400(it) },
        ) {
            findAccessible(request.path.code)
                ?.let { cvService.update(it.code, request.body.internalize()) }
                ?.let { PutCv.Response200(it.externalize()) }
                ?: PutCv.Response404(Error("CV not found"))
        }

    @PreAuthorize("hasAuthority('CvAuthority.WRITE')")
    override suspend fun deleteCv(request: DeleteCv.Request): DeleteCv.Response<*> =
        findAccessible(request.path.code)
            ?.let {
                cvService.deleteByCode(it.code)
                DeleteCv.Response204(Unit)
            }
            ?: DeleteCv.Response404(Error("CV not found"))

    /**
     * Reads a CV in the Flock template from an uploaded PDF (base64) without storing
     * it; the editor shows the result to check and save. Only admins get the person
     * the CV belongs to looked up: everybody else always imports their own CV.
     */
    @PreAuthorize("hasAuthority('CvAuthority.WRITE')")
    override suspend fun postCvImport(request: PostCvImport.Request): PostCvImport.Response<*> {
        val pdf =
            runCatching { Base64.getDecoder().decode(request.body.pdf.substringAfter("base64,").trim()) }
                .getOrElse { return PostCvImport.Response400(Error("pdf is not valid base64")) }
        return try {
            val imported = cvImportService.read(pdf, matchPerson = authentication().isAdmin())
            val cv = imported.cv
            PostCvImport.Response200(
                CvImportApi(
                    personId = imported.person?.uuid?.toString(),
                    name = cv.name,
                    email = cv.email,
                    language = cv.language?.externalize(),
                    place = cv.place,
                    phone = cv.phone,
                    summary = cv.summary,
                    experiences = cv.experiences.map { it.externalize() },
                    education = cv.education,
                    subjects = cv.subjects,
                    languages = cv.languages,
                ),
            )
        } catch (e: CvImportException) {
            PostCvImport.Response400(Error(e.message))
        }
    }

    /** The CV with [code], when the current user may see it: their own, or any for an admin. */
    private fun findAccessible(code: String): Cv? {
        val auth = authentication()
        return cvService
            .findByCode(code)
            ?.takeIf { auth.isAdmin() || auth.isAssociatedWith(it.person) }
    }

    /**
     * Runs [block] and turns the validation failures of the CV service into the typed
     * error responses of the contract: a second CV in the same language for a person
     * is a 409, anything else that is wrong with the input is a 400.
     */
    private inline fun <R> validated(
        onConflict: (Error) -> R,
        onBadRequest: (Error) -> R,
        block: () -> R,
    ): R =
        try {
            block()
        } catch (e: CvAlreadyExistsException) {
            onConflict(Error(e.message))
        } catch (e: CvValidationException) {
            onBadRequest(Error(e.message))
        }

    private fun Cv.externalize() =
        CvApi(
            id = id,
            code = code,
            language = language.externalize(),
            place = place,
            phone = phone,
            summary = summary,
            experiences = experiences.map { it.externalize() },
            skills = skills.map { CvSkillApi(category = it.category, name = it.name, level = it.level) },
            education = education,
            subjects = subjects,
            languages = languages,
            updatedAt = updatedAt.toString(),
            person = person.externalize(),
        )

    private fun CvExperience.externalize() =
        CvExperienceApi(
            from = from.toString(),
            to = to?.toString(),
            role = role,
            client = client,
            employer = employer,
            technologies = technologies,
            description = description,
        )

    private fun CvExperienceForm.externalize() =
        CvExperienceApi(
            from = from.toString(),
            to = to?.toString(),
            role = role,
            client = client,
            employer = employer,
            technologies = technologies,
            description = description,
        )

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
            language = language.internalize(),
            place = place,
            phone = phone,
            summary = summary,
            experiences = experiences.orEmpty().mapIndexed { index, it -> it.internalize("experiences[$index]") },
            skills =
                skills.orEmpty().mapIndexed { index, it ->
                    CvSkillForm(
                        category = it.category,
                        name = it.name.validated("skills[$index].name").value,
                        level = it.level,
                    )
                },
            education = education,
            subjects = subjects,
            languages = languages,
        )
    }

    private fun CvExperienceFormApi.internalize(field: String) =
        CvExperienceForm(
            from = YearMonth.parse(from.validated("$field.from").value),
            to = to?.validated("$field.to")?.value?.let(YearMonth::parse),
            role = role.validated("$field.role").value.trim(),
            client = client.validated("$field.client").value.trim(),
            employer = employer,
            technologies = technologies.orEmpty(),
            description = description,
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

    private fun Authentication.isAdmin(): Boolean = authorities.any { it.authority == CvAuthority.ADMIN.toName() }

    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    private fun GetCvAll.Queries.toPageable(): Pageable = PageRequest.of(page ?: 0, size ?: 20, parseSort(sort?.split(",")))

    private fun String.toUuidOrBadRequest(field: String): UUID =
        runCatching { UUID.fromString(trim()) }
            .getOrElse { throw ResponseStatusException(HttpStatus.BAD_REQUEST, "$field must be a UUID") }
}
