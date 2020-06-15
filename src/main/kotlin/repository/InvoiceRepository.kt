package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Invoice
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface InvoiceRepository : PagingAndSortingRepository<Invoice, UUID>{
    fun deleteByReference(reference:UUID)
}
