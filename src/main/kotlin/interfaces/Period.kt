package community.flock.eco.workday.interfaces

import community.flock.eco.workday.utils.DateUtils.dateRange
import community.flock.eco.workday.utils.DateUtils.filterInPeriod
import community.flock.eco.workday.utils.DateUtils.toDateRange
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

interface Period {
    val from: LocalDate
    val to: LocalDate?

    fun Period.toDateRange() = dateRange(this.from, this.to)
}

fun <T : Period> Iterable<T>.filterInRange(date: LocalDate) = this
    .filter { it.inRange(date) }

fun Period.inRange(date: LocalDate) = this
    .let { it.from <= date && it.to?.let { to -> to >= date } ?: true }

fun <T : Period> Iterable<T>.betweenRange(period: Period) = this
    .filter { it.betweenRange(period) }

fun Period.betweenRange(period: Period) = this
    .let { it.from <= period.to && it.to?.let { to -> to >= period.from } ?: true }

fun Period.toDateRange() = dateRange(this.from, this.to)

fun Period.toDateRangeInPeriod(from: LocalDate, to: LocalDate) = dateRange(from, to)
    .filterInPeriod(this)

fun Period.toDateRangeInPeriod(yearMonth: YearMonth) = yearMonth
    .toDateRange()
    .filterInPeriod(this)

fun Period.toDateRangeInPeriod(period: Period) = period.toDateRange()
    .filterInPeriod(this)

fun Period.countDays() = ChronoUnit.DAYS.between(this.from, this.to) + 1
