package community.flock.eco.workday.application.expense

import community.flock.eco.workday.api.endpoint.CostExpenseCreate
import community.flock.eco.workday.api.endpoint.CostExpenseUpdate
import community.flock.eco.workday.api.endpoint.ExpenseAll
import community.flock.eco.workday.api.endpoint.ExpenseById
import community.flock.eco.workday.api.endpoint.ExpenseDeleteById
import community.flock.eco.workday.api.endpoint.TravelExpenseCreate
import community.flock.eco.workday.api.endpoint.TravelExpenseUpdate
import community.flock.eco.workday.api.model.CostExpenseDetails
import community.flock.eco.workday.api.model.CostExpenseFile
import community.flock.eco.workday.api.model.Error
import community.flock.eco.workday.api.model.ExpenseType
import community.flock.eco.workday.api.model.TravelExpenseDetails
import community.flock.eco.workday.api.model.validate
import community.flock.eco.workday.application.controllers.isAssociatedWith
import community.flock.eco.workday.application.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.application.utils.toDomain
import community.flock.eco.workday.core.utils.toResponse
import community.flock.eco.workday.domain.common.Status
import community.flock.eco.workday.domain.common.Direction
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.common.Sort
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.CostExpenseService
import community.flock.eco.workday.domain.expense.Expense
import community.flock.eco.workday.domain.expense.ExpenseService
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.expense.TravelExpenseService
import org.springframework.boot.web.server.MimeMappings
import org.springframework.http.HttpStatus.FORBIDDEN
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.util.UUID
import community.flock.eco.workday.api.model.Expense as ExpenseApi
import community.flock.eco.workday.api.model.ExpenseStatus as StatusApi
import community.flock.eco.workday.api.model.UUID as UUIDApi

interface ExpenseHandler :
    ExpenseAll.Handler,
    ExpenseById.Handler,
    ExpenseDeleteById.Handler,
    CostExpenseCreate.Handler,
    CostExpenseUpdate.Handler,
    TravelExpenseCreate.Handler,
    TravelExpenseUpdate.Handler

@RestController
class ExpenseController(
    private val documentService: DocumentStorage,
    private val expenseService: ExpenseService,
    private val travelExpenseMapper: TravelExpenseMapper,
    private val travelExpenseService: TravelExpenseService,
    private val costExpenseService: CostExpenseService,
    private val costExpenseMapper: CostExpenseMapper,
) : ExpenseHandler {
    fun authentication(): Authentication = SecurityContextHolder.getContext().authentication

    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    override suspend fun expenseAll(request: ExpenseAll.Request): ExpenseAll.Response<*> {
        val personId = request.queries.personId.let(UUID::fromString)
        val defaultSort: List<Sort> =
            listOf(
                Sort(property = "date", direction = Direction.DESC),
                Sort(property = "id", direction = Direction.ASC),
            )

        val pageable = toDomain(request.queries.page, request.queries.size, request.queries.sort, defaultSort)

        return when {
            authentication().isAdmin() -> expenseService.findAllByPersonUuid(personId, pageable)
            else -> expenseService.findAllByPersonUserCode(authentication().name, pageable)
        }.map {
            when (it) {
                is TravelExpense -> it.produce()
                is CostExpense -> it.produce()
            }
        }.let {
            ExpenseAll.Response200(it.content, it.totalElements.toInt())
        }
    }

    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    override suspend fun expenseById(request: ExpenseById.Request): ExpenseById.Response<*> {
        val id = request.path.id.let(UUID::fromString)
        return expenseService
            .findById(id)
            ?.applyAuthentication(authentication())
            ?.let {
                when (it) {
                    is TravelExpense -> it.produce()
                    is CostExpense -> it.produce()
                }
            }?.let { ExpenseById.Response200(it) }
            ?: ExpenseById.Response404(Error("Expense not found"))
    }

    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    override suspend fun expenseDeleteById(request: ExpenseDeleteById.Request): ExpenseDeleteById.Response<*> {
        val id = request.path.id.let(UUID::fromString)
        return expenseService
            .findById(id)
            ?.applyAuthentication(authentication())
            ?.run { expenseService.deleteById(id) }
            ?.let { ExpenseDeleteById.Response204(Unit) }
            ?: ExpenseDeleteById.Response404(Error("Expense not found"))
    }

    // TODO: convert this to a wirespec integration too. This does require wirespec to allow for raw bytearrays to be returned
    @GetMapping("/api/expenses/files/{file}/{name}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    fun getFiles(
        @PathVariable file: UUID,
        @PathVariable name: String,
    ): ResponseEntity<ByteArray> =
        documentService
            .readDocument(file)
            .run {
                ResponseEntity
                    .ok()
                    .contentType(getMediaType(name))
                    .body(this)
            }

    // TODO: convert this to a wirespec integaration to. For this, the network layer needs to support content-type multiplart/form-data.
// or, the frontend needs to send the data raw as a base64 string
    @PostMapping("/api/expenses/files")
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun postFiles(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<UUID> =
        documentService
            .storeDocument(file.bytes)
            .toResponse()

    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    override suspend fun costExpenseCreate(request: CostExpenseCreate.Request): CostExpenseCreate.Response<*> =
        request.body
            .run { costExpenseMapper.consume(this) }
            .run { costExpenseService.create(this) }
            .produce()
            .let {
                CostExpenseCreate.Response200(it)
            }

    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    override suspend fun costExpenseUpdate(request: CostExpenseUpdate.Request): CostExpenseUpdate.Response<*> {
        val id = request.path.id.let(UUID::fromString)
        return expenseService
            .findById(id)
            ?.applyAuthentication(authentication())
            ?.applyAllowedToUpdate(request.body.status.consume(), authentication().isAdmin())
            ?.run {
                val consume = costExpenseMapper.consume(request.body, this.id)
                costExpenseService.update(
                    id = id,
                    input = consume,
                    isUpdatedByOwner = authentication().isOwnerOf(this),
                )
            }?.produce()
            ?.let { CostExpenseUpdate.Response200(it) }
            ?: CostExpenseUpdate.Response500(Error("Cannot update cost expense"))
    }

    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    override suspend fun travelExpenseCreate(request: TravelExpenseCreate.Request): TravelExpenseCreate.Response<*> =
        request.body
            .run { travelExpenseMapper.consume(this) }
            .run { travelExpenseService.create(this) }
            .produce()
            .let { TravelExpenseCreate.Response200(it) }

    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    override suspend fun travelExpenseUpdate(request: TravelExpenseUpdate.Request): TravelExpenseUpdate.Response<*> {
        val id = request.path.id.let(UUID::fromString)
        return expenseService
            .findById(id)
            ?.applyAuthentication(authentication())
            ?.applyAllowedToUpdate(request.body.status.consume(), authentication().isAdmin())
            ?.run {
                val updatedExpense = travelExpenseMapper.consume(request.body, id)
                travelExpenseService.update(
                    id = id,
                    input = updatedExpense,
                    isUpdatedByOwner = authentication().isOwnerOf(this),
                )
            }?.produce()
            ?.let { TravelExpenseUpdate.Response200(it) }
            ?: TravelExpenseUpdate.Response500(Error("Cannot update travel expense"))
    }
}

private fun TravelExpense.produce(): ExpenseApi =
    ExpenseApi(
        id = id.toString(),
        personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
        description = description ?: "",
        date = date.toString(),
        status = status.produce(),
        expenseType = ExpenseType.TRAVEL,
        costDetails = null,
        travelDetails =
            TravelExpenseDetails(
                distance = distance,
                allowance = allowance,
            ),
    )

private fun Status.produce(): StatusApi =
    when (this) {
        Status.REQUESTED -> StatusApi.REQUESTED
        Status.APPROVED -> StatusApi.APPROVED
        Status.REJECTED -> StatusApi.REJECTED
        Status.DONE -> StatusApi.DONE
    }

private fun Expense.applyAuthentication(authentication: Authentication) =
    apply {
        if (!authentication.isAdmin() && !authentication.isOwnerOf(this)) {
            throw ResponseStatusException(
                FORBIDDEN,
                "User has no access to expense: $id",
            )
        }
    }

private fun Authentication.isAdmin(): Boolean =
    this.authorities
        .map { it.authority }
        .contains(ExpenseAuthority.ADMIN.toName())

private fun Authentication.isOwnerOf(expense: Expense) = isAssociatedWith(expense.person)

private fun getMediaType(name: String): MediaType {
    val extension = File(name).extension.lowercase()
    val mime = MimeMappings.DEFAULT[extension]
    return MediaType.parseMediaType(mime)
}

private fun CostExpense.produce() =
    ExpenseApi(
        id = id.toString(),
        personId = UUIDApi(person.uuid.toString()).also(UUIDApi::validate),
        description = description ?: "",
        date = date.toString(),
        status = status.produce(),
        expenseType = ExpenseType.COST,
        travelDetails = null,
        costDetails =
            CostExpenseDetails(
                amount = amount,
                files = files.map { it.produce() },
            ),
    )

private fun Document.produce() =
    CostExpenseFile(
        name = name,
        file = UUIDApi(file.toString()).also(UUIDApi::validate),
    )
