package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteContract
import community.flock.eco.workday.api.endpoint.GetContractAll
import community.flock.eco.workday.api.endpoint.GetContractByCode
import community.flock.eco.workday.api.endpoint.PostContractExternal
import community.flock.eco.workday.api.endpoint.PostContractInternal
import community.flock.eco.workday.api.endpoint.PostContractManagement
import community.flock.eco.workday.api.endpoint.PostContractService
import community.flock.eco.workday.api.endpoint.PutContractExternal
import community.flock.eco.workday.api.endpoint.PutContractInternal
import community.flock.eco.workday.api.endpoint.PutContractManagement
import community.flock.eco.workday.api.endpoint.PutContractService
import community.flock.eco.workday.application.authorities.ContractAuthority
import community.flock.eco.workday.application.forms.ContractExternalForm
import community.flock.eco.workday.application.forms.ContractInternalForm
import community.flock.eco.workday.application.forms.ContractManagementForm
import community.flock.eco.workday.application.forms.ContractServiceForm
import community.flock.eco.workday.application.model.Contract
import community.flock.eco.workday.application.model.ContractExternal
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.ContractManagement
import community.flock.eco.workday.application.model.ContractService
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.util.UUID
import community.flock.eco.workday.api.model.Contract as ContractApi
import community.flock.eco.workday.api.model.ContractExternal as ContractExternalApi
import community.flock.eco.workday.api.model.ContractExternalForm as ContractExternalFormApi
import community.flock.eco.workday.api.model.ContractInternal as ContractInternalApi
import community.flock.eco.workday.api.model.ContractInternalForm as ContractInternalFormApi
import community.flock.eco.workday.api.model.ContractManagement as ContractManagementApi
import community.flock.eco.workday.api.model.ContractManagementForm as ContractManagementFormApi
import community.flock.eco.workday.api.model.ContractService as ContractServiceApi
import community.flock.eco.workday.api.model.ContractServiceForm as ContractServiceFormApi
import community.flock.eco.workday.api.model.ContractType as ContractTypeApi
import community.flock.eco.workday.api.model.Person as PersonApi
import community.flock.eco.workday.application.model.ContractType as ContractTypeInternal
import community.flock.eco.workday.application.model.Person as PersonInternal
import community.flock.eco.workday.application.services.ContractService as ContractDomainService

@RestController
class ContractController(
    private val userService: UserService,
    private val contractService: ContractDomainService,
) : GetContractAll.Handler,
    GetContractByCode.Handler,
    DeleteContract.Handler,
    PostContractInternal.Handler,
    PutContractInternal.Handler,
    PostContractExternal.Handler,
    PutContractExternal.Handler,
    PostContractManagement.Handler,
    PutContractManagement.Handler,
    PostContractService.Handler,
    PutContractService.Handler {
    @PreAuthorize("hasAuthority('ContractAuthority.READ')")
    override suspend fun getContractAll(request: GetContractAll.Request): GetContractAll.Response<*> {
        val q = request.queries
        val pageable = q.toPageable()

        val to = q.to?.let(LocalDate::parse)
        val start = q.start?.let(LocalDate::parse)
        val end = q.end?.let(LocalDate::parse)
        val personId = q.personId?.let(UUID::fromString)

        val contracts: List<Contract> =
            when {
                personId != null -> {
                    val user = requireAuthority(ContractAuthority.READ)
                    if (user.hasAuthority(ContractAuthority.ADMIN)) {
                        contractService.findAllByPersonUuid(personId, pageable).content
                    } else {
                        contractService.findAllByPersonUserCode(user.code, pageable).content
                    }
                }
                to != null -> {
                    requireAuthority(ContractAuthority.ADMIN)
                    contractService.findAllByToAfterOrToNull(to, pageable).content
                }
                start != null || end != null -> {
                    requireAuthority(ContractAuthority.ADMIN)
                    contractService.findAllByToBetween(start, end).sortedByDescending { it.to }
                }
                else -> {
                    requireAuthority(ContractAuthority.ADMIN)
                    contractService.findAll(pageable).content.sortedBy { it.to }
                }
            }

        return GetContractAll.Response200(contracts.map { it.externalize() })
    }

    @PreAuthorize("hasAuthority('ContractAuthority.READ')")
    override suspend fun getContractByCode(request: GetContractByCode.Request): GetContractByCode.Response<*> {
        requireAuthority(ContractAuthority.READ)
        val contract =
            contractService.findByCode(request.path.code)
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found")
        return GetContractByCode.Response200(contract.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.ADMIN')")
    override suspend fun deleteContract(request: DeleteContract.Request): DeleteContract.Response<*> {
        requireAuthority(ContractAuthority.ADMIN)
        contractService.deleteByCode(request.path.code)
        return DeleteContract.Response204(Unit)
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun postContractInternal(request: PostContractInternal.Request): PostContractInternal.Response<*> {
        val user = requireAuthority(ContractAuthority.WRITE)
        val isAdmin = user.hasAuthority(ContractAuthority.ADMIN)
        val form = request.body.internalize()
        val personId = if (isAdmin) form.personId else UUID.fromString(user.code)
        val created =
            contractService.create(form.copy(personId = personId))
                ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create internal contract")
        return PostContractInternal.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun putContractInternal(request: PutContractInternal.Request): PutContractInternal.Response<*> {
        requireAuthority(ContractAuthority.WRITE)
        val updated =
            contractService.update(request.path.code, request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found")
        return PutContractInternal.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun postContractExternal(request: PostContractExternal.Request): PostContractExternal.Response<*> {
        requireAuthority(ContractAuthority.WRITE)
        val created =
            contractService.create(request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create external contract")
        return PostContractExternal.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun putContractExternal(request: PutContractExternal.Request): PutContractExternal.Response<*> {
        requireAuthority(ContractAuthority.WRITE)
        val updated =
            contractService.update(request.path.code, request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found")
        return PutContractExternal.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun postContractManagement(request: PostContractManagement.Request): PostContractManagement.Response<*> {
        requireAuthority(ContractAuthority.WRITE)
        val created =
            contractService.create(request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create management contract")
        return PostContractManagement.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun putContractManagement(request: PutContractManagement.Request): PutContractManagement.Response<*> {
        requireAuthority(ContractAuthority.WRITE)
        val updated =
            contractService.update(request.path.code, request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found")
        return PutContractManagement.Response200(updated.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun postContractService(request: PostContractService.Request): PostContractService.Response<*> {
        requireAuthority(ContractAuthority.WRITE)
        val created =
            contractService.create(request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create service contract")
        return PostContractService.Response200(created.externalize())
    }

    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    override suspend fun putContractService(request: PutContractService.Request): PutContractService.Response<*> {
        requireAuthority(ContractAuthority.WRITE)
        val updated =
            contractService.update(request.path.code, request.body.internalize())
                ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found")
        return PutContractService.Response200(updated.externalize())
    }

    private fun requireAuthority(authority: ContractAuthority): User {
        val auth =
            SecurityContextHolder.getContext().authentication
                ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
        if (!auth.authorities.map { it.authority }.contains(authority.toName())) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN)
        }
        return userService.findByCode(auth.name)
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
    }

    private fun User.hasAuthority(authority: ContractAuthority): Boolean = authorities.contains(authority.toName())

    private fun Contract.externalize(): ContractApi =
        ContractApi(
            id = id,
            code = code,
            from = from.toString(),
            to = to?.toString(),
            person = person?.externalize(),
            type = type.externalize(),
        )

    private fun ContractInternal.externalize(): ContractInternalApi =
        ContractInternalApi(
            id = id,
            code = code,
            from = from.toString(),
            to = to?.toString(),
            person = person?.externalize(),
            type = type.externalize(),
            monthlySalary = monthlySalary,
            hoursPerWeek = hoursPerWeek,
            holidayHours = holidayHours,
            hackHours = hackHours,
            billable = billable,
        )

    private fun ContractExternal.externalize(): ContractExternalApi =
        ContractExternalApi(
            id = id,
            code = code,
            from = from.toString(),
            to = to?.toString(),
            person = person?.externalize(),
            type = type.externalize(),
            hourlyRate = hourlyRate,
            hoursPerWeek = hoursPerWeek,
            billable = billable,
        )

    private fun ContractManagement.externalize(): ContractManagementApi =
        ContractManagementApi(
            id = id,
            code = code,
            from = from.toString(),
            to = to?.toString(),
            person = person?.externalize(),
            type = type.externalize(),
            monthlyFee = monthlyFee,
        )

    private fun ContractService.externalize(): ContractServiceApi =
        ContractServiceApi(
            id = id,
            code = code,
            from = from.toString(),
            to = to?.toString(),
            person = person?.externalize(),
            type = type.externalize(),
            monthlyCosts = monthlyCosts,
            description = description,
        )

    private fun ContractTypeInternal.externalize(): ContractTypeApi =
        when (this) {
            ContractTypeInternal.INTERNAL -> ContractTypeApi.INTERNAL
            ContractTypeInternal.EXTERNAL -> ContractTypeApi.EXTERNAL
            ContractTypeInternal.MANAGEMENT -> ContractTypeApi.MANAGEMENT
            ContractTypeInternal.SERVICE -> ContractTypeApi.SERVICE
        }

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
            user = null,
            fullName = "$firstname $lastname",
        )

    private fun ContractInternalFormApi.internalize() =
        ContractInternalForm(
            personId = personId?.let(UUID::fromString) ?: error("personId is required"),
            monthlySalary = monthlySalary ?: 0.0,
            hoursPerWeek = hoursPerWeek ?: 0,
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse),
            holidayHours = holidayHours ?: 0,
            hackHours = hackHours ?: 0,
            billable = billable ?: true,
        )

    private fun ContractExternalFormApi.internalize() =
        ContractExternalForm(
            personId = personId?.let(UUID::fromString) ?: error("personId is required"),
            hourlyRate = hourlyRate ?: 0.0,
            hoursPerWeek = hoursPerWeek ?: 0,
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse),
            billable = billable ?: true,
        )

    private fun ContractManagementFormApi.internalize() =
        ContractManagementForm(
            personId = personId?.let(UUID::fromString) ?: error("personId is required"),
            monthlyFee = monthlyFee ?: 0.0,
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse),
        )

    private fun ContractServiceFormApi.internalize() =
        ContractServiceForm(
            monthlyCosts = monthlyCosts ?: 0.0,
            description = description ?: "",
            from = from?.let(LocalDate::parse) ?: error("from is required"),
            to = to?.let(LocalDate::parse),
        )

    private fun GetContractAll.Queries.toPageable(): Pageable {
        val sortOrder = sort?.takeIf { it.isNotBlank() }?.let { Sort.by(it) } ?: Sort.unsorted()
        return PageRequest.of(page ?: 0, size ?: 20, sortOrder)
    }
}
