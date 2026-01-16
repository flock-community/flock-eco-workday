package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Event

sealed interface ExpenseEvent<T : ApprovalStatus> : Event {
    val entity: Expense<T>
}

data class CreateExpenseEvent<T : ApprovalStatus>(
    override val entity: Expense<T>,
) : ExpenseEvent<T>

data class UpdateExpenseEvent<T : ApprovalStatus>(
    override val entity: Expense<T>,
) : ExpenseEvent<T>

data class DeleteExpenseEvent<T : ApprovalStatus>(
    override val entity: Expense<T>,
) : ExpenseEvent<T>
