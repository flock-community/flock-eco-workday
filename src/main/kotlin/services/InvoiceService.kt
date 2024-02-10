package community.flock.eco.workday.services

import CreateExpenseEvent
import ExpenseEvent
import UpdateExpenseEvent
import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.exactonline.clients.ExactonlineDocumentClient
import community.flock.eco.workday.exactonline.model.ExactonlineDocument
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentAttachment
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentType
import community.flock.eco.workday.exactonline.services.ExactonlineAuthenticationService
import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Document
import community.flock.eco.workday.model.Invoice
import community.flock.eco.workday.model.InvoiceStatus
import community.flock.eco.workday.model.InvoiceType
import community.flock.eco.workday.repository.InvoiceRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import reactor.core.publisher.Flux
import java.util.UUID
import javax.servlet.http.HttpSession
import javax.transaction.Transactional

@Service
class InvoiceService(
    private val invoiceRepository: InvoiceRepository,
    private val exactonlineAuthenticationService: ExactonlineAuthenticationService,
    private val exactonlineDocumentClient: ExactonlineDocumentClient,
    private val documentService: DocumentService,
) {
    fun findAll(pageable: Pageable): Page<Invoice> = invoiceRepository.findAll(pageable)

    fun findById(id: UUID): Invoice? = invoiceRepository.findById(id).toNullable()

    fun uploadExactonline(
        httpSession: HttpSession,
        id: UUID,
    ) = invoiceRepository.findById(id).toNullable()
        ?.run {
            exactonlineAuthenticationService
                .accessToken(httpSession)
                .flatMapMany { requestObject ->
                    exactonlineDocumentClient.postDocument(requestObject, toExactonlineDocument())
                        .flatMapMany { exactDocument ->
                            Flux.fromIterable(documents)
                                .flatMap {
                                        document ->
                                    exactonlineDocumentClient.postDocumentAttachment(
                                        requestObject,
                                        document.toExactonlineDocumentAttachment(exactDocument),
                                    )
                                }
                        }
                }
                .collectList()
                .doOnNext {
                    invoiceRepository.save(
                        this.copy(
                            status = InvoiceStatus.PROCESSED,
                        ),
                    )
                }
        }

    private fun Invoice.toExactonlineDocument() =
        ExactonlineDocument(
            subject = description,
            type = ExactonlineDocumentType.PURCHASE,
        )

    private fun Document.toExactonlineDocumentAttachment(document: ExactonlineDocument) =
        ExactonlineDocumentAttachment(
            document = document.id!!,
            fileName = name,
            attachment = documentService.readDocument(file),
        )

    @TransactionalEventListener(value = [CreateExpenseEvent::class, UpdateExpenseEvent::class], phase = TransactionPhase.BEFORE_COMMIT)
    fun handleCreateExpenseEvent(ev: ExpenseEvent) =
        when (val entity = ev.entity) {
            is CostExpense -> generateCostExpenseInvoice(entity)
            else -> null
        }

    @Transactional
    fun generateCostExpenseInvoice(expense: CostExpense) =
        expense
            .apply { invoiceRepository.deleteByReference(id) }
            .run {
                Invoice(
                    description = expense.description.orEmpty(),
                    type = InvoiceType.EXPENSE,
                    reference = expense.id,
                    amount = 100.0,
                    documents = expense.files,
                    status = InvoiceStatus.NEW,
                )
            }
            .run { invoiceRepository.save(this) }
            .run { println(this) }
}
