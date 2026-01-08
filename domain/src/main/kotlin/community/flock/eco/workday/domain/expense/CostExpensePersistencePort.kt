package community.flock.eco.workday.domain.expense

import java.util.UUID

interface CostExpensePersistencePort {
    fun create(costExpense: CostExpense): CostExpense

    fun findById(id: UUID): CostExpense?

    fun updateIfExists(
        id: UUID,
        costExpense: CostExpense,
    ): CostExpense?
}
