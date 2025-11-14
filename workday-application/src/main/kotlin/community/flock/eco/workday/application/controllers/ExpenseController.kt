package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.model.CostExpenseDetails
import community.flock.eco.workday.api.model.CostExpenseFile
import community.flock.eco.workday.api.model.CostExpenseInput
import community.flock.eco.workday.api.model.ExpenseType
import community.flock.eco.workday.api.model.TravelExpenseDetails
import community.flock.eco.workday.api.model.TravelExpenseInput
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
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus.FORBIDDEN
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.util.UUID
import community.flock.eco.workday.api.model.Expense as ExpenseApi
import community.flock.eco.workday.api.model.ExpenseStatus as StatusApi
import community.flock.eco.workday.api.model.UUID as UUIDApi

@RestController
@RequestMapping("/api/expenses")
class ExpenseController(
    private val documentService: DocumentStorage,
    private val expenseService: ExpenseService,
) {
    @GetMapping(params = ["personId"])
    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    fun getExpenseAll(
        @RequestParam personId: UUID,
        authentication: Authentication,
        pageable: Pageable,
    ): ResponseEntity<List<ExpenseApi>> =
        when {
            authentication.isAdmin() -> expenseService.findAllByPersonUuid(personId, pageable)
            else -> expenseService.findAllByPersonUserCode(authentication.name, pageable)
        }.map {
            when (it) {
                is TravelExpense -> it.produce()
                is CostExpense -> it.produce()
                else -> error("Unsupported expense type")
            }
        }.toResponse()

    @GetMapping("{id}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    fun getExpenseById(
        @PathVariable id: UUID,
        authentication: Authentication,
    ): ResponseEntity<ExpenseApi> =
        expenseService
            .findById(id)
            ?.applyAuthentication(authentication)
            ?.let {
                when (it) {
                    is TravelExpense -> it.produce()
                    is CostExpense -> it.produce()
                    else -> error("Unsupported expense type")
                }
            }.toResponse()

    @DeleteMapping("{id}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun deleteExpenseById(
        @PathVariable id: UUID,
        authentication: Authentication,
    ): ResponseEntity<Unit> =
        expenseService
            .findById(id)
            ?.applyAuthentication(authentication)
            ?.run { expenseService.deleteById(id) }
            .toResponse()

    @GetMapping("/files/{file}/{name}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    fun getFiles(
        @PathVariable file: UUID,
        @PathVariable name: String,
        authentication: Authentication,
    ): ResponseEntity<ByteArray> =
        documentService
            .readDocument(file)
            .run {
                ResponseEntity
                    .ok()
                    .contentType(getMediaType(name))
                    .body(this)
            }

    @PostMapping("/files")
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun postFiles(
        @RequestParam("file") file: MultipartFile,
        authentication: Authentication,
    ): ResponseEntity<UUID> =
        documentService
            .storeDocument(file.bytes)
            .toResponse()
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

@RestController
@RequestMapping("/api/expenses-travel")
class TravelExpenseController(
    private val service: TravelExpenseService,
    private val mapper: TravelExpenseMapper,
    private val expenseService: ExpenseService,
) {
    @PostMapping
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun postTravelExpense(
        @RequestBody input: TravelExpenseInput,
        authentication: Authentication,
    ): ResponseEntity<ExpenseApi> =
        input
            .run { mapper.consume(this) }
            .run { service.create(this) }
            .produce()
            .toResponse()

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun putTravelExpense(
        @PathVariable id: UUID,
        @RequestBody input: TravelExpenseInput,
        authentication: Authentication,
    ): ResponseEntity<ExpenseApi> =
        expenseService
            .findById(id)
            ?.applyAuthentication(authentication)
            ?.applyAllowedToUpdate(input.status.consume(), authentication.isAdmin())
            ?.run {
                val updatedExpense = mapper.consume(input, id)
                service.update(
                    id = id,
                    input = updatedExpense,
                    isUpdatedByOwner = authentication.isOwnerOf(this),
                )
            }?.produce()
            .toResponse()
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

@RestController
@RequestMapping("/api/expenses-cost")
class CostExpenseController(
    private val service: CostExpenseService,
    private val mapper: CostExpenseMapper,
    private val expenseService: ExpenseService,
) {
    @PostMapping
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun postCostExpense(
        @RequestBody input: CostExpenseInput,
        authentication: Authentication,
    ): ResponseEntity<ExpenseApi> =
        input
            .run { mapper.consume(this) }
            .run { service.create(this) }
            .produce()
            .toResponse()

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun putCostExpense(
        @PathVariable id: UUID,
        @RequestBody input: CostExpenseInput,
        authentication: Authentication,
    ): ResponseEntity<ExpenseApi> =
        expenseService
            .findById(id)
            ?.applyAuthentication(authentication)
            ?.applyAllowedToUpdate(input.status.consume(), authentication.isAdmin())
            ?.run {
                val consume = mapper.consume(input, id)
                service.update(
                    id = id,
                    input = consume,
                    isUpdatedByOwner = authentication.isOwnerOf(this),
                )
            }?.produce()
            .toResponse()
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
