package community.flock.eco.workday.application.expense

import community.flock.eco.workday.core.utils.toDomainPage
import community.flock.eco.workday.core.utils.toEntity
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.common.Page
import community.flock.eco.workday.domain.common.Pageable
import community.flock.eco.workday.domain.expense.Expense
import community.flock.eco.workday.domain.expense.ExpensePersistencePort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID
import community.flock.eco.workday.application.expense.CostExpense as CostExpenseEntity
import community.flock.eco.workday.application.expense.Expense as ExpenseEntity
import community.flock.eco.workday.application.expense.TravelExpense as TravelExpenseEntity

@Component
class ExpensePersistenceAdapter(
    private val expenseRepository: ExpenseRepository,
) : ExpensePersistencePort {
    override fun findAll(pageable: Pageable): Page<Expense> = expenseRepository
        .findAll(pageable.toEntity())
        .toDomainPage { toExpenseDomain() }

    override fun findByIdOrNull(id: UUID): Expense? =
        expenseRepository
            .findByIdOrNull(id)
            ?.toExpenseDomain()

    override fun findAllByPersonUuid(
        personId: UUID,
        pageable: Pageable
    ): Page<Expense> = expenseRepository
        .findAllByPersonUuid(personId, pageable.toEntity())
        .toDomainPage { toExpenseDomain() }

    override fun findAllByPersonUserCode(
        personCode: String,
        pageable: Pageable
    ): Page<Expense> {
        return expenseRepository
            .findAllByPersonUserCode(personCode, pageable.toEntity())
            .toDomainPage { toExpenseDomain() }
    }

    override fun findAllByStatus(status: Status): List<Expense> =
        expenseRepository
            .findAllByStatus(status)
            .map { it.toExpenseDomain() }

    @Transactional
    override fun delete(id: UUID): Expense? =
        expenseRepository
            .findByIdOrNull(id)
            ?.run {
                val expense = toExpenseDomain()
                expenseRepository.delete(this)
                expense
            }

    private fun ExpenseEntity.toExpenseDomain(): Expense =
        when (this) {
            is CostExpenseEntity -> toDomain()
            is TravelExpenseEntity -> toDomain()
            else -> error("Unsupported expense type")
        }
}

