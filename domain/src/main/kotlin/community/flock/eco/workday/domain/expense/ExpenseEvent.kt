package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.Event

sealed class ExpenseEvent(
    open val entity: Expense,
) : Event

data class CreateExpenseEvent(
    override val entity: Expense,
) : ExpenseEvent(entity)

data class UpdateExpenseEvent(
    override val entity: Expense,
) : ExpenseEvent(entity)

data class DeleteExpenseEvent(
    override val entity: Expense,
) : ExpenseEvent(entity)
