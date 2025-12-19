package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Invoice
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface InvoiceRepository : JpaRepository<Invoice, UUID> {
    fun deleteByReference(reference: UUID)
}
