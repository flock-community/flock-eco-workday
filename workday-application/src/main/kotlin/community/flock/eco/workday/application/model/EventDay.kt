package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.ManyToOne
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

// Joined child of `day`: reuses `day_seq` and the shared `day_days` table — its
// migration must add only the `event_day` join row, not a sequence or collection table.
@Entity
@EntityListeners(EventEntityListeners::class)
class EventDay(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    from: LocalDate = LocalDate.now(),
    to: LocalDate = LocalDate.now(),
    hours: Double,
    days: MutableList<Double>? = null,
    var cost: BigDecimal? = null,
    // null falls back to the category derived from event.type; set per row to split a person across budgets.
    @Enumerated(EnumType.STRING)
    var budgetCategory: BudgetCategory? = null,
    // Set while holiday or sickness cut this hack day sign-up; the hours to put back once the absence goes.
    var signedUpHours: Double? = null,
    @ManyToOne
    val person: Person,
    @ManyToOne
    val event: Event,
) : Day(id, code, from, to, hours, days) {
    /** Cut to nothing by holiday or sickness: kept only to restore the sign-up, not an attendance. */
    val missedEntirely: Boolean get() = signedUpHours != null && hours <= 0.0
}
