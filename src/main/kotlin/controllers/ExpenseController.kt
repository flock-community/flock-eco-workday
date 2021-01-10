package community.flock.eco.workday.controllers


import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.ExpenseAuthority
import community.flock.eco.workday.mappers.CostExpenseMapper
import community.flock.eco.workday.mappers.TravelExpenseMapper
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.services.CostExpenseService
import community.flock.eco.workday.services.ExpenseService
import community.flock.eco.workday.services.TravelExpenseService
import community.flock.eco.workday.services.isUser
import community.flock.eco.workday.graphql.CostExpenseInput
import community.flock.eco.workday.graphql.TravelExpenseInput
import community.flock.eco.workday.services.DocumentService
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
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
import java.util.UUID
import javax.transaction.Transactional

@RestController
@RequestMapping("/api/expenses")
class ExpenseController(
    private val documentService: DocumentService,
    private val expenseService: ExpenseService
) {
    @GetMapping(params = ["personId"])
    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    fun getExpenseAll(
        @RequestParam personId: UUID,
        authentication: Authentication,
        pageable: Pageable
    ) = when {
        authentication.isAdmin() -> expenseService.findAllByPersonCode(personId, pageable)
        else -> expenseService.findAllByPersonUserCode(authentication.name, pageable)
    }
        .toResponse()


    @GetMapping("{id}")
    fun getExpenseById(
        @PathVariable id: UUID,
        authentication: Authentication
    ) = expenseService
        .findById(id)
        .toResponse()

    @DeleteMapping("{id}")
    fun deleteExpenseById(
        @PathVariable id: UUID,
        authentication: Authentication
    ) = expenseService
        .deleteById(id)
        .toResponse()

    @GetMapping("/files/{file}/{name}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.READ')")
    fun getFiles(
        @PathVariable file: UUID,
        @PathVariable name: String,
        authentication: Authentication
    ) = documentService.readDocument(file)
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
        authentication: Authentication
    ) = documentService
        .storeDocument(file.bytes)
        .toResponse()
}

@RestController
@RequestMapping("/api/expenses-travel")
class TravelExpenseController(
    private val service: TravelExpenseService,
    private val mapper: TravelExpenseMapper
) {
    @PostMapping
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun postTravelExpense(
        @RequestBody input: TravelExpenseInput,
        authentication: Authentication
    ) = input
        .run { mapper.consume(this) }
        .run { service.create(this) }
        .toResponse()

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun putTravelExpense(
        @PathVariable id: UUID,
        @RequestBody input: TravelExpenseInput,
        authentication: Authentication
    ) = input
        .run { mapper.consume(this, id) }
        .run { service.update(id,this) }
        .toResponse()
}

@RestController
@RequestMapping("/api/expenses-cost")
class CostExpenseController(
    private val service: CostExpenseService,
    private val mapper: CostExpenseMapper
)  {
    @PostMapping
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun postCostExpense(
        @RequestBody input: CostExpenseInput,
        authentication: Authentication
    ) = input
        .run { mapper.consume(this) }
        .run { service.create(this) }
        .toResponse()

    @PutMapping("{id}")
    @PreAuthorize("hasAuthority('ExpenseAuthority.WRITE')")
    fun putCostExpense(
        @PathVariable id: UUID,
        @RequestBody input: CostExpenseInput,
        authentication: Authentication
    ) = input
        .run { mapper.consume(this, id) }
        .run { service.update(id,this) }
        .toResponse()
}

private fun Authentication.isAdmin(): Boolean = this.authorities
    .map { it.authority }
    .contains(ExpenseAuthority.ADMIN.toName())

private fun Expense.applyAuthentication(authentication: Authentication) = apply {
    if (!(authentication.isAdmin() || this.person.isUser(authentication.name))) {
        throw ResponseStatusException(HttpStatus.UNAUTHORIZED, "User has not access to expenses: ${this.id}")
    }
}

private fun getMediaType(name: String): MediaType {
    val extension = java.io.File(name).extension.toLowerCase()
    val mime = org.springframework.boot.web.server.MimeMappings.DEFAULT.get(extension)
    return MediaType.parseMediaType(mime)
}

