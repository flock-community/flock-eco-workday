package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteLaptop
import community.flock.eco.workday.api.endpoint.GetLaptopAll
import community.flock.eco.workday.api.endpoint.GetLaptopByCode
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
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import community.flock.eco.workday.api.model.Laptop as LaptopApi
import community.flock.eco.workday.api.model.LaptopForm as LaptopFormApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.application.model.Person as PersonInternal

@RestController
class LaptopController(
    private val laptopService: LaptopService,
) : GetLaptopAll.Handler,
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

    private fun LaptopFormApi.internalize() =
        LaptopForm(
            name = name.orEmpty(),
            serialNumber = serialNumber.orEmpty(),
            contractSigned = contractSigned ?: false,
            personId =
                personId?.takeIf { it.isNotBlank() }?.let {
                    it.toUuidOrNull() ?: throw LaptopInvalidInputException("personId must be a UUID")
                },
        )

    private fun GetLaptopAll.Queries.toPageable(): Pageable = PageRequest.of(page ?: 0, size ?: 20, parseSort(sort?.split(",")))

    private fun String.toUuidOrNull(): UUID? = runCatching { UUID.fromString(trim()) }.getOrNull()
}
