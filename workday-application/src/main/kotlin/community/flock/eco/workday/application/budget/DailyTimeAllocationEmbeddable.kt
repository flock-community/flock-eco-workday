package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocationType
import jakarta.persistence.Embeddable
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import java.time.LocalDate

@Embeddable
class DailyTimeAllocationEmbeddable(
    val date: LocalDate,
    val hours: Double,
    @Enumerated(EnumType.STRING)
    val type: BudgetAllocationType,
)
