package community.flock.eco.workday.application.budget

import community.flock.eco.workday.api.endpoint.BudgetAllocationAll
import community.flock.eco.workday.api.endpoint.BudgetAllocationDeleteById
import community.flock.eco.workday.api.endpoint.BudgetSummary
import community.flock.eco.workday.api.endpoint.HackTimeAllocationCreate
import community.flock.eco.workday.api.endpoint.HackTimeAllocationUpdate
import community.flock.eco.workday.api.endpoint.StudyMoneyAllocationCreate
import community.flock.eco.workday.api.endpoint.StudyMoneyAllocationUpdate
import community.flock.eco.workday.api.endpoint.StudyTimeAllocationCreate
import community.flock.eco.workday.api.endpoint.StudyTimeAllocationUpdate
import community.flock.eco.workday.api.model.Error
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.core.utils.toResponse
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocationService
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
    HackTimeAllocationCreate.Handler,
    HackTimeAllocationUpdate.Handler,
    StudyTimeAllocationCreate.Handler,
    StudyTimeAllocationUpdate.Handler,
    StudyMoneyAllocationCreate.Handler,
    StudyMoneyAllocationUpdate.Handler

@RestController
class BudgetAllocationController(
    private val documentService: DocumentStorage,
    private val budgetAllocationService: BudgetAllocationService,
    private val hackTimeBudgetAllocationService: HackTimeBudgetAllocationService,
    private val studyTimeBudgetAllocationService: StudyTimeBudgetAllocationService,
    private val studyMoneyBudgetAllocationService: StudyMoneyBudgetAllocationService,
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

        val personUuid = when {
            authentication().isAdmin() && personId != null -> UUID.fromString(personId)
            else -> {
                val person = personService.findByUserCode(authentication().name)
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

        val allocations = when {
            authentication().isAdmin() -> when {
                eventCode != null -> budgetAllocationService.findAllByEventCode(eventCode)
                personId != null -> budgetAllocationService.findAllByPersonUuid(UUID.fromString(personId), year)
                else -> emptyList()
            }
            else -> {
                val person = personService.findByUserCode(authentication().name)
                    ?.toDomain()
                    ?: error("Cannot find person for current user")
                budgetAllocationService.findAllByPersonUuid(person.uuid, year)
            }
        }

        return BudgetAllocationAll.Response200(
            allocations.map {
                when (it) {
                    is HackTimeBudgetAllocation -> it.produce()
                    is StudyTimeBudgetAllocation -> it.produce()
                    is StudyMoneyBudgetAllocation -> it.produce()
                }
            },
        )
    }

    override suspend fun budgetAllocationDeleteById(request: BudgetAllocationDeleteById.Request): BudgetAllocationDeleteById.Response<*> {
        requireWrite()
        val id = request.path.id.toLong()
        return budgetAllocationService.deleteById(id)
            ?.let { BudgetAllocationDeleteById.Response204(Unit) }
            ?: BudgetAllocationDeleteById.Response404(Error("Budget allocation not found"))
    }

    override suspend fun hackTimeAllocationCreate(request: HackTimeAllocationCreate.Request): HackTimeAllocationCreate.Response<*> {
        requireWrite()
        return budgetAllocationMapper
            .consumeHackTime(request.body)
            .let { hackTimeBudgetAllocationService.create(it) }
            .produce()
            .let { HackTimeAllocationCreate.Response200(it) }
    }

    override suspend fun hackTimeAllocationUpdate(request: HackTimeAllocationUpdate.Request): HackTimeAllocationUpdate.Response<*> {
        requireWrite()
        val id = request.path.id.toLong()
        return budgetAllocationMapper
            .consumeHackTime(request.body, id)
            .let { hackTimeBudgetAllocationService.update(id, it) }
            ?.produce()
            ?.let { HackTimeAllocationUpdate.Response200(it) }
            ?: HackTimeAllocationUpdate.Response500(Error("Cannot update hack time allocation"))
    }

    override suspend fun studyTimeAllocationCreate(request: StudyTimeAllocationCreate.Request): StudyTimeAllocationCreate.Response<*> {
        requireWrite()
        return budgetAllocationMapper
            .consumeStudyTime(request.body)
            .let { studyTimeBudgetAllocationService.create(it) }
            .produce()
            .let { StudyTimeAllocationCreate.Response200(it) }
    }

    override suspend fun studyTimeAllocationUpdate(request: StudyTimeAllocationUpdate.Request): StudyTimeAllocationUpdate.Response<*> {
        requireWrite()
        val id = request.path.id.toLong()
        return budgetAllocationMapper
            .consumeStudyTime(request.body, id)
            .let { studyTimeBudgetAllocationService.update(id, it) }
            ?.produce()
            ?.let { StudyTimeAllocationUpdate.Response200(it) }
            ?: StudyTimeAllocationUpdate.Response500(Error("Cannot update study time allocation"))
    }

    override suspend fun studyMoneyAllocationCreate(request: StudyMoneyAllocationCreate.Request): StudyMoneyAllocationCreate.Response<*> {
        requireWrite()
        return budgetAllocationMapper
            .consumeStudyMoney(request.body)
            .let { studyMoneyBudgetAllocationService.create(it) }
            .produce()
            .let { StudyMoneyAllocationCreate.Response200(it) }
    }

    override suspend fun studyMoneyAllocationUpdate(request: StudyMoneyAllocationUpdate.Request): StudyMoneyAllocationUpdate.Response<*> {
        requireWrite()
        val id = request.path.id.toLong()
        return budgetAllocationMapper
            .consumeStudyMoney(request.body, id)
            .let { studyMoneyBudgetAllocationService.update(id, it) }
            ?.produce()
            ?.let { StudyMoneyAllocationUpdate.Response200(it) }
            ?: StudyMoneyAllocationUpdate.Response500(Error("Cannot update study money allocation"))
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
