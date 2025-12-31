package community.flock.eco.workday.application.events

import community.flock.eco.workday.application.model.Expense
import community.flock.eco.workday.core.events.Event

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
