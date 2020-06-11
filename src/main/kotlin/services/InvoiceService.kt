package community.flock.eco.workday.services

import CreateExpenseEvent
import ExpenseEvent
import UpdateExpenseEvent
import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.exactonline.clients.ExactonlineDocumentClient
import community.flock.eco.feature.exactonline.clients.ExactonlineUserClient
import community.flock.eco.workday.exactonline.model.ExactonlineDocument
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentAttachment
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentType
import community.flock.eco.workday.exactonline.services.ExactonlineAuthenticationService
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Invoice
import community.flock.eco.workday.model.InvoiceType
import community.flock.eco.workday.repository.InvoiceRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import java.util.UUID
import javax.servlet.http.HttpSession
import javax.transaction.Transactional


@Service
class InvoiceService(
    private val invoiceRepository: InvoiceRepository,
    private val exactonlineAuthenticationService: ExactonlineAuthenticationService,
    private val exactonlineUserClient: ExactonlineUserClient,
    private val exactonlineDocumentClient: ExactonlineDocumentClient,
    private val documentService: DocumentService
) {

    fun findAll(pageable: Pageable): Page<Invoice> = invoiceRepository.findAll(pageable)
    fun findById(id: UUID): Invoice? = invoiceRepository.findById(id).toNullable()

    fun uploadExactonline(httpSession: HttpSession, id: UUID) = invoiceRepository.findById(id).toNullable()
        ?.run {
            exactonlineAuthenticationService
                .accessToken(httpSession)
                .flatMap { requestObject ->
                    exactonlineDocumentClient.postDocument(requestObject, ExactonlineDocument(
                        subject = description,
                        type = ExactonlineDocumentType.PURCHASE
                    )).flatMap { document ->
                        exactonlineDocumentClient.postDocumentAttachment(requestObject, ExactonlineDocumentAttachment(
                            document = document.id!!,
                            fileName = documents.first().name,
                            attachment = documentService.readDocument(documents.first().file)
                        ))
                    }


                }
        }


    @TransactionalEventListener(value = [CreateExpenseEvent::class, UpdateExpenseEvent::class], phase = TransactionPhase.BEFORE_COMMIT)
    fun handleCreateExpenseEvent(ev: ExpenseEvent) = when (val entity = ev.entity) {
        is CostExpense -> generateCostExpenseInvoice(entity)
        else -> null
    }

    @Transactional
    fun generateCostExpenseInvoice(expense: CostExpense) = expense
        .apply { invoiceRepository.deleteByReference(id) }
        .run {
            Invoice(
                description = expense.description.orEmpty(),
                type = InvoiceType.EXPENSE,
                reference = expense.id,
                amount = 100.0,
                documents = expense.files
            )
        }
        .run { invoiceRepository.save(this) }
        .run { println(this) }
}
