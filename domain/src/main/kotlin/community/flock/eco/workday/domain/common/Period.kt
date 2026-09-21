package community.flock.eco.workday.domain.common

import java.time.LocalDate

/**
 * Something that runs from a start date to an end date, both inclusive. An absent end date means
 * the period is open-ended: it runs until further notice.
 */
interface Period {
    val from: LocalDate
    val to: LocalDate?

    /** True when [date] falls within this period. */
    fun inRange(date: LocalDate): Boolean = !date.isBefore(from) && (to?.let { !date.isAfter(it) } ?: true)

    /** True when this period and [other] share at least one day. */
    fun overlaps(other: Period): Boolean {
        val startsBeforeOtherEnds = other.to?.let { !from.isAfter(it) } ?: true
        val endsAfterOtherStarts = to?.let { !it.isBefore(other.from) } ?: true
        return startsBeforeOtherEnds && endsAfterOtherStarts
    }
}
