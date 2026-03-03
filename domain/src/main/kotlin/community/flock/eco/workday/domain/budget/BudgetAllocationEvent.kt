package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.Event

sealed interface BudgetAllocationEvent : Event {
    val entity: BudgetAllocation
}

data class CreateBudgetAllocationEvent(
    override val entity: BudgetAllocation,
) : BudgetAllocationEvent

data class UpdateBudgetAllocationEvent(
    override val entity: BudgetAllocation,
) : BudgetAllocationEvent

data class DeleteBudgetAllocationEvent(
    override val entity: BudgetAllocation,
) : BudgetAllocationEvent
