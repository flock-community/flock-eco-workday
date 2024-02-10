package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.services.InvoiceService
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID
import javax.servlet.http.HttpSession

@RestController
@RequestMapping("/api/invoices")
class InvoiceController(
    private val invoiceService: InvoiceService,
) {
    @GetMapping
    @PreAuthorize("hasAuthority('InvoiceAuthority.READ')")
    fun getInvoiceAll(pageable: Pageable) =
        invoiceService.findAll(pageable)
            .toResponse()

    @PostMapping("upload_invoice")
    @PreAuthorize("hasAuthority('InvoiceAuthority.WRITE')")
    fun uploadToExactonline(
        httpsSession: HttpSession,
        @RequestBody body: UploadInvoice,
    ) = invoiceService
        .uploadExactonline(httpsSession, body.id)
        .toResponse()
}

data class UploadInvoice(val id: UUID)
