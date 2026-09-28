package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.event.BudgetCategory
import java.math.BigDecimal
import java.time.LocalDate

/**
 * What a person may spend of the hack and training budgets their internal contract grants in a
 * year, what they spent of it, and the event days it went to.
 */
data class PersonBudgetSummary(
    val hackTimeBudget: PersonBudgetItem,
    val trainingTimeBudget: PersonBudgetItem,
    val trainingMoneyBudget: PersonBudgetItem,
    val events: List<PersonBudgetEvent>,
)

/** An event day that drew on one of the budgets. */
data class PersonBudgetEvent(
    val eventCode: String,
    val description: String,
    val from: LocalDate,
    val hours: Double,
    val cost: BigDecimal?,
    val category: BudgetCategory,
)

/** One budget: what was granted and what was used. */
data class PersonBudgetItem(
    val budget: BigDecimal,
    val used: BigDecimal,
) {
    val available: BigDecimal get() = budget - used
}
