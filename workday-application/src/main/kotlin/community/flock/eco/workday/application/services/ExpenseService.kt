package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.events.DeleteExpenseEvent
import community.flock.eco.workday.application.model.Expense
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.application.repository.ExpenseRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID

@Service
@Transactional
class ExpenseService(
    private val expenseRepository: ExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun findAll(pageable: Pageable): Page<Expense> =
        expenseRepository
            .findAll(pageable)

    fun findById(id: UUID): Expense? =
        expenseRepository
            .findById(id)
            .toNullable()

    fun findAllByPersonUuid(
        personId: UUID,
        pageable: Pageable,
    ): Page<Expense> =
        expenseRepository
            .findAllByPersonUuid(personId, pageable)

    fun findAllByPersonUserCode(
        personCode: String,
        pageable: Pageable,
    ): Page<Expense> =
        expenseRepository
            .findAllByPersonUserCode(personCode, pageable)

    fun findAllByStatus(status: Status) = expenseRepository.findAllByStatus(status)

    @Transactional
    fun deleteById(id: UUID) =
        expenseRepository
            .findByIdOrNull(id)
            ?.run {
                expenseRepository
                    .delete(this)
                    // TODO: nobody listens to this event, can we remove?
                    //  especially since 'this' is removed from the hibernate cache
                    .also { applicationEventPublisher.publishEvent(DeleteExpenseEvent(this)) }
            }
}

