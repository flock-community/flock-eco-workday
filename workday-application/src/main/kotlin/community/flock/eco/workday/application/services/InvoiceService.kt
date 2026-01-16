package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.exactonline.clients.ExactonlineDocumentClient
import community.flock.eco.workday.application.exactonline.model.ExactonlineDocument
import community.flock.eco.workday.application.exactonline.model.ExactonlineDocumentAttachment
import community.flock.eco.workday.application.exactonline.model.ExactonlineDocumentType
import community.flock.eco.workday.application.exactonline.services.ExactonlineAuthenticationService
import community.flock.eco.workday.application.mappers.toEntity
import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Invoice
import community.flock.eco.workday.application.model.InvoiceStatus
import community.flock.eco.workday.application.model.InvoiceType
import community.flock.eco.workday.application.repository.InvoiceRepository
import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.CreateExpenseEvent
import community.flock.eco.workday.domain.expense.ExpenseEvent
import community.flock.eco.workday.domain.expense.UpdateExpenseEvent
import jakarta.servlet.http.HttpSession
import jakarta.transaction.Transactional
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import reactor.core.publisher.Flux
import java.util.UUID

@Service
class InvoiceService(
    private val invoiceRepository: InvoiceRepository,
    private val exactonlineAuthenticationService: ExactonlineAuthenticationService,
    private val exactonlineDocumentClient: ExactonlineDocumentClient,
    private val documentService: DocumentStorage,
) {
    fun findAll(pageable: Pageable): Page<Invoice> = invoiceRepository.findAll(pageable)

    fun uploadExactonline(
        httpSession: HttpSession,
        id: UUID,
    ) = invoiceRepository
        .findById(id)
        .toNullable()
        ?.run {
            exactonlineAuthenticationService
                .accessToken(httpSession)
                .flatMapMany { requestObject ->
                    exactonlineDocumentClient
                        .postDocument(requestObject, toExactonlineDocument())
                        .flatMapMany { exactDocument ->
                            Flux
                                .fromIterable(documents)
                                .flatMap { document ->
                                    exactonlineDocumentClient.postDocumentAttachment(
                                        requestObject,
                                        document.toExactonlineDocumentAttachment(exactDocument),
                                    )
                                }
                        }
                }.collectList()
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
    fun handleCreateExpenseEvent(ev: ExpenseEvent<*>) =
        when (val entity = ev.entity) {
            is CostExpense -> generateCostExpenseInvoice(entity)
            else -> null
        }

    @Transactional
    fun generateCostExpenseInvoice(expense: CostExpense<*>) =
        expense
            .apply { invoiceRepository.deleteByReference(id) }
            .run {
                Invoice(
                    description = expense.description.orEmpty(),
                    type = InvoiceType.EXPENSE,
                    reference = expense.id,
                    amount = 100.0,
                    documents = expense.files.map { it.toEntity() },
                    status = InvoiceStatus.NEW,
                )
            }.run { invoiceRepository.save(this) }
            .run { println(this) }
}
