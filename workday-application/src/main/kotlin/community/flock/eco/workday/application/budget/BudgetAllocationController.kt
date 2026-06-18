package community.flock.eco.workday.application.budget

import community.flock.eco.workday.api.endpoint.BudgetAllocationAll
import community.flock.eco.workday.api.endpoint.BudgetAllocationDeleteById
import community.flock.eco.workday.api.endpoint.BudgetSummary
import community.flock.eco.workday.api.endpoint.MoneyAllocationCreate
import community.flock.eco.workday.api.endpoint.MoneyAllocationUpdate
import community.flock.eco.workday.api.endpoint.TimeAllocationCreate
import community.flock.eco.workday.api.endpoint.TimeAllocationUpdate
import community.flock.eco.workday.api.model.Error
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.core.utils.toResponse
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.MoneyAllocationService
import community.flock.eco.workday.domain.budget.TimeAllocationService
import org.springframework.boot.web.server.MimeMappings
import org.springframework.http.HttpStatus
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
import java.time.LocalDate
import java.util.UUID

interface BudgetAllocationHandler :
    BudgetAllocationAll.Handler,
    BudgetAllocationDeleteById.Handler,
    BudgetSummary.Handler,
    TimeAllocationCreate.Handler,
    TimeAllocationUpdate.Handler,
    MoneyAllocationCreate.Handler,
    MoneyAllocationUpdate.Handler

@RestController
class BudgetAllocationController(
    private val documentService: DocumentStorage,
    private val budgetAllocationService: BudgetAllocationService,
    private val timeAllocationService: TimeAllocationService,
    private val moneyAllocationService: MoneyAllocationService,
    private val budgetAllocationMapper: BudgetAllocationApiMapper,
    private val budgetSummaryService: BudgetSummaryService,
    private val personService: PersonService,
) : BudgetAllocationHandler {
    fun authentication(): Authentication = SecurityContextHolder.getContext().authentication

    private fun requireRead() {
        if (!authentication().hasAuthority(BudgetAllocationAuthority.READ)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Requires BudgetAllocationAuthority.READ")
        }
    }

    private fun requireWrite() {
        if (!authentication().hasAuthority(BudgetAllocationAuthority.WRITE)) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "Requires BudgetAllocationAuthority.WRITE")
        }
    }

    override suspend fun budgetSummary(request: BudgetSummary.Request): BudgetSummary.Response<*> {
        requireRead()
        val personId = request.queries.personId
        val year = request.queries.year ?: LocalDate.now().year

        val personUuid =
            when {
                authentication().isAdmin() && personId != null -> UUID.fromString(personId)
                else -> {
                    val person =
                        personService
                            .findByUserCode(authentication().name)
                            ?.toDomain()
                            ?: error("Cannot find person for current user")
                    person.uuid
                }
            }

        val summary = budgetSummaryService.getSummary(personUuid, year)
        return BudgetSummary.Response200(summary)
    }

    override suspend fun budgetAllocationAll(request: BudgetAllocationAll.Request): BudgetAllocationAll.Response<*> {
        requireRead()
        val personId = request.queries.personId
        val eventCode = request.queries.eventCode
        val year = request.queries.year ?: LocalDate.now().year

        val allocations =
            when {
                authentication().isAdmin() ->
                    when {
                        eventCode != null -> budgetAllocationService.findAllByEventCode(eventCode)
                        personId != null -> budgetAllocationService.findAllByPersonUuid(UUID.fromString(personId), year)
                        else -> emptyList()
                    }
                else -> {
                    val person =
                        personService
                            .findByUserCode(authentication().name)
                            ?.toDomain()
                            ?: error("Cannot find person for current user")
                    budgetAllocationService.findAllByPersonUuid(person.uuid, year)
                }
            }

        return BudgetAllocationAll.Response200(allocations.map { it.produce() })
    }

    override suspend fun budgetAllocationDeleteById(request: BudgetAllocationDeleteById.Request): BudgetAllocationDeleteById.Response<*> {
        requireWrite()
        return budgetAllocationService
            .deleteByCode(request.path.id)
            ?.let { BudgetAllocationDeleteById.Response204(Unit) }
            ?: BudgetAllocationDeleteById.Response404(Error("Budget allocation not found"))
    }

    override suspend fun timeAllocationCreate(request: TimeAllocationCreate.Request): TimeAllocationCreate.Response<*> {
        requireWrite()
        return budgetAllocationMapper
            .consumeTime(request.body)
            .let { timeAllocationService.create(it) }
            .produce()
            .let { TimeAllocationCreate.Response200(it) }
    }

    override suspend fun timeAllocationUpdate(request: TimeAllocationUpdate.Request): TimeAllocationUpdate.Response<*> {
        requireWrite()
        val code = request.path.id
        return budgetAllocationMapper
            .consumeTime(request.body, code)
            .let { timeAllocationService.update(code, it) }
            ?.produce()
            ?.let { TimeAllocationUpdate.Response200(it) }
            ?: TimeAllocationUpdate.Response500(Error("Cannot update time allocation"))
    }

    override suspend fun moneyAllocationCreate(request: MoneyAllocationCreate.Request): MoneyAllocationCreate.Response<*> {
        requireWrite()
        return budgetAllocationMapper
            .consumeMoney(request.body)
            .let { moneyAllocationService.create(it) }
            .produce()
            .let { MoneyAllocationCreate.Response200(it) }
    }

    override suspend fun moneyAllocationUpdate(request: MoneyAllocationUpdate.Request): MoneyAllocationUpdate.Response<*> {
        requireWrite()
        val code = request.path.id
        return budgetAllocationMapper
            .consumeMoney(request.body, code)
            .let { moneyAllocationService.update(code, it) }
            ?.produce()
            ?.let { MoneyAllocationUpdate.Response200(it) }
            ?: MoneyAllocationUpdate.Response500(Error("Cannot update money allocation"))
    }

    @GetMapping("/api/budget-allocations/files/{file}/{name}")
    @PreAuthorize("hasAuthority('BudgetAllocationAuthority.READ')")
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

    @PostMapping("/api/budget-allocations/files")
    @PreAuthorize("hasAuthority('BudgetAllocationAuthority.WRITE')")
    fun postFiles(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<UUID> =
        documentService
            .storeDocument(file.bytes)
            .toResponse()
}

private fun Authentication.isAdmin(): Boolean =
    authorities
        .map { it.authority }
        .contains(BudgetAllocationAuthority.ADMIN.toName())

private fun Authentication.hasAuthority(authority: BudgetAllocationAuthority): Boolean =
    authorities
        .map { it.authority }
        .contains(authority.toName())

private fun getMediaType(name: String): MediaType {
    val extension = File(name).extension.lowercase()
    val mime = MimeMappings.DEFAULT[extension]
    return MediaType.parseMediaType(mime)
}
