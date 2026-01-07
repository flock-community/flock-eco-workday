package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.events.DeleteExpenseEvent
import community.flock.eco.workday.application.repository.ExpenseRepository
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.expense.Expense
import jakarta.transaction.Transactional
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.util.UUID
import community.flock.eco.workday.application.model.CostExpense as CostExpenseEntity
import community.flock.eco.workday.application.model.Expense as ExpenseEntity
import community.flock.eco.workday.application.model.TravelExpense as TravelExpenseEntity

@Service
@Transactional
class ExpenseService(
    private val expenseRepository: ExpenseRepository,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun findAll(pageable: Pageable): Page<Expense> =
        expenseRepository
            .findAll(pageable)
            .map { it.toExpenseDomain() }

    fun findById(id: UUID): Expense? =
        expenseRepository
            .findByIdOrNull(id)
            ?.toExpenseDomain()

    fun findAllByPersonUuid(
        personId: UUID,
        pageable: Pageable,
    ): Page<Expense> =
        expenseRepository
            .findAllByPersonUuid(personId, pageable)
            .map { it.toExpenseDomain() }

    fun findAllByPersonUserCode(
        personCode: String,
        pageable: Pageable,
    ): Page<Expense> =
        expenseRepository
            .findAllByPersonUserCode(personCode, pageable)
            .map { it.toExpenseDomain() }

    fun findAllByStatus(status: Status): List<Expense> =
        expenseRepository
            .findAllByStatus(status)
            .map { it.toExpenseDomain() }

    @Transactional
    fun deleteById(id: UUID): Expense? =
        expenseRepository
            .findByIdOrNull(id)
            ?.run {
                val expense = toExpenseDomain()
                expenseRepository
                    .delete(this)
                    // TODO: nobody listens to this event, can we remove?
                    //  especially since 'this' is removed from the hibernate cache
                    .also { applicationEventPublisher.publishEvent(DeleteExpenseEvent(this)) }
                expense
            }

    private fun ExpenseEntity.toExpenseDomain(): Expense =
        when (this) {
            is CostExpenseEntity -> toDomain()
            is TravelExpenseEntity -> toDomain()
            else -> error("Unsupported expense type")
        }
}
