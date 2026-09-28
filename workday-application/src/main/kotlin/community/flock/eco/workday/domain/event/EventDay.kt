package community.flock.eco.workday.domain.event

import community.flock.eco.workday.domain.common.Day
import community.flock.eco.workday.domain.person.Person
import java.math.BigDecimal
import java.time.LocalDate

/**
 * One person's share of an [Event]: the hours they attend and the part of the costs that lands on
 * them. Without a [budgetCategory] of its own the share is drawn from the budget the event's type
 * implies, see [Event.budgetCategoryOf].
 */
data class EventDay(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate,
    override val hours: Double,
    override val days: List<Double>?,
    val cost: BigDecimal?,
    val budgetCategory: BudgetCategory?,
    val person: Person,
) : Day
