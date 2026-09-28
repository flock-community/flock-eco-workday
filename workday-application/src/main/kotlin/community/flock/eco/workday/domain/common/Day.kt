package community.flock.eco.workday.domain.common

import java.time.LocalDate

/**
 * A registration of hours over a closed range of days: a work day, a leave day, a sick day or a
 * person's day at an event. Unlike an open-ended [Period] a day always has an end date.
 */
interface Day :
    Period,
    Hours {
    val internalId: Long
    val code: String
    override val to: LocalDate
}
