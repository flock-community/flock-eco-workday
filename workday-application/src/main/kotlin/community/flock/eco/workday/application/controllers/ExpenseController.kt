package community.flock.eco.workday.application.controllers

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
import community.flock.eco.workday.application.authorities.ExpenseAuthority
import community.flock.eco.workday.application.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.application.mappers.CostExpenseMapper
import community.flock.eco.workday.application.mappers.TravelExpenseMapper
import community.flock.eco.workday.application.mappers.consume
import community.flock.eco.workday.application.model.CostExpense
import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Expense
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.TravelExpense
import community.flock.eco.workday.application.services.CostExpenseService
import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.application.services.ExpenseService
import community.flock.eco.workday.application.services.TravelExpenseService
import community.flock.eco.workday.core.utils.toResponse
import org.springframework.boot.web.server.MimeMappings
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
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
        val defaultSort =
            Sort
                .by("date")
                .descending()
                .and(Sort.by("id"))

        val pageable =
            request.queries.pageable
                ?.let {
                    PageRequest.of(
                        it.size,
                        it.page,
                        it.sort.consumeSorting(defaultSort),
                    )
                }

                ?: PageRequest.of(0, 20, defaultSort)
        return when {
            authentication().isAdmin() -> expenseService.findAllByPersonUuid(personId, pageable)
            else -> expenseService.findAllByPersonUserCode(authentication().name, pageable)
        }.map {
            when (it) {
                is TravelExpense -> it.produce()
                is CostExpense -> it.produce()
                else -> error("Unsupported expense type")
            }
        }.let {
            ExpenseAll.Response200(it.content)
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
                    else -> error("Unsupported expense type")
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
            ?.let { ExpenseDeleteById.Response204(it) }
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
                val consume = costExpenseMapper.consume(request.body, id)
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
    val mime = MimeMappings.DEFAULT.get(extension)
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

/**
 * Sorting parameters can be send in various formats:
 *
 * Workday isn't very specific on how to do this, so multiple things are seen. Would be good te generalize on this
 * --> and put this in the wirespec contracts too
 *
 * e.g.
 * - date,asc
 * - date desc, id
 * - person.personId, date desc
 *
 * NOTE: Current implementation only supports a single sort and will always sort asc
 * e.g. date,desc will sort by date ascending
 */
private fun List<String>?.consumeSorting(defaultSort: Sort): Sort =
    this
        ?.firstOrNull()
        ?.split(",")
        ?.let { s -> Sort.by(Sort.Order.asc(s.first())) }
        ?: defaultSort
