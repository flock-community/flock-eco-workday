package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteLaptop
import community.flock.eco.workday.api.endpoint.GetLaptopAll
import community.flock.eco.workday.api.endpoint.GetLaptopByCode
import community.flock.eco.workday.api.endpoint.GetLaptopMe
import community.flock.eco.workday.api.endpoint.PostLaptop
import community.flock.eco.workday.api.endpoint.PutLaptop
import community.flock.eco.workday.api.model.Error
import community.flock.eco.workday.application.forms.LaptopForm
import community.flock.eco.workday.application.model.Laptop
import community.flock.eco.workday.application.services.LaptopInvalidInputException
import community.flock.eco.workday.application.services.LaptopSerialNumberInUseException
import community.flock.eco.workday.application.services.LaptopService
import community.flock.eco.workday.application.services.LaptopValidationException
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
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.Laptop as LaptopApi
import community.flock.eco.workday.api.model.LaptopForm as LaptopFormApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.application.model.Person as PersonInternal

@RestController
class LaptopController(
    private val laptopService: LaptopService,
) : GetLaptopAll.Handler,
    GetLaptopMe.Handler,
    GetLaptopByCode.Handler,
    PostLaptop.Handler,
    PutLaptop.Handler,
    DeleteLaptop.Handler {
    @PreAuthorize("hasAuthority('LaptopAuthority.READ')")
    override suspend fun getLaptopAll(request: GetLaptopAll.Request): GetLaptopAll.Response<*> {
        val q = request.queries
        val pageable = q.toPageable()
        val personId =
            q.personId?.let {
                it.toUuidOrNull() ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "personId must be a UUID")
            }
        val page =
            when (personId) {
                null -> laptopService.findAll(pageable)
                else -> laptopService.findAllByPersonUuid(personId, pageable)
            }
        return GetLaptopAll.Response200(
            body = page.content.map { it.externalize() },
            xtotal = page.totalElements.toInt(),
        )
    }

    /**
     * The laptops handed out to the person of the current user. Seeing your own laptops
     * takes no laptop authority: everybody may check which laptops they have and whether
     * the contract for them is signed.
     */
    @PreAuthorize("isAuthenticated()")
    override suspend fun getLaptopMe(request: GetLaptopMe.Request): GetLaptopMe.Response<*> =
        GetLaptopMe.Response200(
            laptopService.findAllByUserCode(authentication().name).map { it.externalize() },
        )

    @PreAuthorize("hasAuthority('LaptopAuthority.READ')")
    override suspend fun getLaptopByCode(request: GetLaptopByCode.Request): GetLaptopByCode.Response<*> =
        laptopService
            .findByCode(request.path.code)
            ?.let { GetLaptopByCode.Response200(it.externalize()) }
            ?: GetLaptopByCode.Response404(Error("Laptop not found"))

    @PreAuthorize("hasAuthority('LaptopAuthority.WRITE')")
    override suspend fun postLaptop(request: PostLaptop.Request): PostLaptop.Response<*> =
        validated(
            onConflict = { PostLaptop.Response409(it) },
            onBadRequest = { PostLaptop.Response400(it) },
        ) {
            val created = laptopService.create(request.body.internalize())
            PostLaptop.Response200(created.externalize())
        }

    @PreAuthorize("hasAuthority('LaptopAuthority.WRITE')")
    override suspend fun putLaptop(request: PutLaptop.Request): PutLaptop.Response<*> =
        validated(
            onConflict = { PutLaptop.Response409(it) },
            onBadRequest = { PutLaptop.Response400(it) },
        ) {
            laptopService
                .update(request.path.code, request.body.internalize())
                ?.let { PutLaptop.Response200(it.externalize()) }
                ?: PutLaptop.Response404(Error("Laptop not found"))
        }

    @PreAuthorize("hasAuthority('LaptopAuthority.ADMIN')")
    override suspend fun deleteLaptop(request: DeleteLaptop.Request): DeleteLaptop.Response<*> {
        laptopService.deleteByCode(request.path.code)
        return DeleteLaptop.Response204(Unit)
    }

    /**
     * Runs [block] and turns the validation failures of the laptop service into the
     * typed error responses of the contract: a serial number that is already taken
     * is a 409, anything else that is wrong with the input is a 400.
     */
    private inline fun <R> validated(
        onConflict: (Error) -> R,
        onBadRequest: (Error) -> R,
        block: () -> R,
    ): R =
        try {
            block()
        } catch (e: LaptopSerialNumberInUseException) {
            onConflict(Error(e.message))
        } catch (e: LaptopValidationException) {
            onBadRequest(Error(e.message))
        }

    private fun Laptop.externalize() =
        LaptopApi(
            id = id,
            code = code,
            name = name,
            serialNumber = serialNumber,
            contractSigned = contractSigned,
            purchaseDate = purchaseDate?.toString(),
            person = person?.externalize(),
        )

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
     * The contract (laptops.ws) states which fields are required and what their values
     * look like; a body that misses a required field never gets here (see
     * [WirespecRequestBodyAdvice]), the refined types are checked with [validated].
     * A laptop is registered with an unsigned contract unless stated otherwise.
     */
    private fun LaptopFormApi.internalize() =
        LaptopForm(
            name = name.validated("name").value.trim(),
            serialNumber = serialNumber.validated("serialNumber").value.trim(),
            contractSigned = contractSigned ?: false,
            purchaseDate =
                purchaseDate?.validated("purchaseDate")?.value?.let {
                    // The pattern fixes the shape, the calendar decides whether 2024-13-45 exists
                    runCatching { LocalDate.parse(it) }.getOrElse { throw LaptopInvalidInputException("purchaseDate is not a valid date") }
                },
            personId = personId?.validated("personId")?.value?.let(UUID::fromString),
        )

    /** Applies the refined type's pattern from the contract; a violation is a 400 with the field name. */
    private fun <T : Wirespec.Refined<String>> T.validated(field: String): T =
        when {
            validate() -> this
            value.isBlank() -> throw LaptopInvalidInputException("$field is required")
            else -> throw LaptopInvalidInputException("$field is invalid")
        }

    private fun authentication(): Authentication =
        SecurityContextHolder.getContext().authentication
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    private fun GetLaptopAll.Queries.toPageable(): Pageable = PageRequest.of(page ?: 0, size ?: 20, parseSort(sort?.split(",")))

    private fun String.toUuidOrNull(): UUID? = runCatching { UUID.fromString(trim()) }.getOrNull()
}
