package community.flock.eco.workday.domain.event

import community.flock.eco.workday.domain.common.Hours
import community.flock.eco.workday.domain.common.Period
import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate

/**
 * A hack day, community day, conference or other event over a range of days, with the people
 * attending it as [eventDays].
 */
data class Event(
    val internalId: Long,
    val code: String,
    val description: String,
    override val from: LocalDate,
    override val to: LocalDate,
    override val hours: Double,
    override val days: List<Double>?,
    val costs: Double,
    val type: EventType,
    val eventDays: List<EventDay>,
) : Period,
    Hours {
    val persons: List<Person> get() = eventDays.map { it.person }.distinct()

    /** The budget an attendee's hours and costs are drawn from by default, or null when the event is not budgeted. */
    val budgetCategory: BudgetCategory?
        get() =
            when (type) {
                EventType.FLOCK_HACK_DAY -> BudgetCategory.HACK
                EventType.CONFERENCE -> BudgetCategory.TRAINING
                EventType.FLOCK_COMMUNITY_DAY, EventType.GENERAL_EVENT -> null
            }

    /** The budget [eventDay] is drawn from: its own category when it has one, otherwise the event's. */
    fun budgetCategoryOf(eventDay: EventDay): BudgetCategory? = eventDay.budgetCategory ?: budgetCategory
}
