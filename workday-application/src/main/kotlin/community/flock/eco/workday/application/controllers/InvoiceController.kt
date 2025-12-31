package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.services.InvoiceService
import community.flock.eco.workday.core.utils.toResponse
import jakarta.servlet.http.HttpSession
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/invoices")
class InvoiceController(
    private val invoiceService: InvoiceService,
) {
    @GetMapping
    @PreAuthorize("hasAuthority('InvoiceAuthority.READ')")
    fun getInvoiceAll(pageable: Pageable) =
        invoiceService
            .findAll(pageable)
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

data class UploadInvoice(
    val id: UUID,
)
