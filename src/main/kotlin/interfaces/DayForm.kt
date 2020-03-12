package community.flock.eco.workday.interfaces

import java.time.temporal.ChronoUnit

interface DayForm : Hours, Period

fun <T: DayForm> T.validate(): T = apply {

    if (this.hours < 0) {
        throw error("Hours cannot have negative value")
    }
    if (this.days?.any { it < 0 } == true) {
        throw error("Days cannot have negative value")
    }

    val daysBetween = ChronoUnit.DAYS.between(this.from, this.to) + 1
    if (this.days != null) {
        if (this.days?.size?.toLong() != daysBetween) {
            throw error("amount of days ($daysBetween) not equal to period (${this.days?.size})")
        }
        if (this.days?.sum() != this.hours) {
            throw error("Total hour does not match")
        }
    }
}
