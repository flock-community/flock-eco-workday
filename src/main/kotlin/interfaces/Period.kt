package community.flock.eco.workday.interfaces

import java.time.LocalDate

interface Period {
    val from: LocalDate
    val to: LocalDate?
}

fun <T : Period> Iterable<T>.filterInRange(date: LocalDate) = this
    .filter { it.inRange(date) }

fun Period.inRange(date: LocalDate) = this
    .let { it.from <= date && it.to?.let { to -> to >= date } ?: true }
