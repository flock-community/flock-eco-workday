package community.flock.eco.workday.domain.budget

import java.time.LocalDate

data class DailyTimeAllocation(
    val date: LocalDate,
    val hours: Double,
    val type: BudgetAllocationType,
)
