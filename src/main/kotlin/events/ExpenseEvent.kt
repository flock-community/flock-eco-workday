
import community.flock.eco.core.events.Event
import community.flock.eco.workday.model.Expense

sealed class ExpenseEvent(open val entity: Expense) : Event
data class CreateExpenseEvent(override val entity: Expense) : ExpenseEvent(entity)
data class UpdateExpenseEvent(override val entity: Expense) : ExpenseEvent(entity)
data class DeleteExpenseEvent(override val entity: Expense) : ExpenseEvent(entity)
