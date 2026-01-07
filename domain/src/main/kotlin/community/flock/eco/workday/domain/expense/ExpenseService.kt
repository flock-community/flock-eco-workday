package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.Status
import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import community.flock.eco.workday.domain.common.Page
import community.flock.eco.workday.domain.common.Pageable
import java.util.UUID

class ExpenseService(
    private val expenseRepository: ExpensePersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun findAll(pageable: Pageable): Page<Expense> =
        expenseRepository
            .findAll(pageable)

    fun findById(id: UUID): Expense? =
        expenseRepository
            .findByIdOrNull(id)

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

    fun findAllByStatus(status: Status): List<Expense> =
        expenseRepository
            .findAllByStatus(status)

    fun deleteById(id: UUID): Expense? =
        expenseRepository
            .delete(id)
            ?.also {
                // TODO: nobody listens to this event, can we remove?
                //  especially since 'this' is removed from the hibernate cache
                applicationEventPublisher.publishEvent(DeleteExpenseEvent(it))
            }
}
