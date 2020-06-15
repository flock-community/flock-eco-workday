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
import community.flock.eco.workday.services.InvoiceService
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.util.UUID
import javax.servlet.http.HttpSession

@RestController
@RequestMapping("/api/invoices")
class InvoiceController(
    private val invoiceService: InvoiceService
) {
    @GetMapping
    @PreAuthorize("hasAuthority('InvoiceAuthority.READ')")
    fun getInvoiceAll(
        pageable: Pageable
    ) = invoiceService.findAll(pageable)
        .toResponse()

    @PostMapping("upload_invoice")
    @PreAuthorize("hasAuthority('InvoiceAuthority.WRITE')")
    fun uploadToExactonline(
        httpsSession: HttpSession,
        @RequestBody body:UploadInvoice
    ) = invoiceService
        .uploadExactonline(httpsSession, body.id)
        .toResponse()

}

data class UploadInvoice(val id:UUID)
