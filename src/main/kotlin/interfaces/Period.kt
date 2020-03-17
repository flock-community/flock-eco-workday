package community.flock.eco.workday.interfaces

import java.time.LocalDate

interface Period {
    val from: LocalDate
    val to: LocalDate?
}

fun Period.inRange(date: LocalDate) = this
    .let { it.from <= date && it.to?.let { to -> to >= date } ?: true }
