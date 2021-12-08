package community.flock.eco.workday.utils

import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.services.FromToPeriod
import community.flock.eco.workday.services.countWorkDaysInPeriod
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

object DateUtils {

    fun dateRange(from: LocalDate, to: LocalDate?) = (0..ChronoUnit.DAYS.between(from, to))
        .map { from.plusDays(it) }

    fun LocalDate.isWorkingDay() = listOf(
        DayOfWeek.MONDAY,
        DayOfWeek.TUESDAY,
        DayOfWeek.WEDNESDAY,
        DayOfWeek.THURSDAY,
        DayOfWeek.FRIDAY
    ).contains(this.dayOfWeek)

    fun YearMonth.toDateRange() = dateRange(this.atDay(1), this.atEndOfMonth())

    fun YearMonth.toPeriod() = FromToPeriod(this.atDay(1), this.atEndOfMonth())

    fun List<LocalDate>.filterInPeriod(period: Period) = this
        .filter { period.from <= it }
        .filter { period.to?.let { to -> to >= it } ?: true }

    fun YearMonth.countWorkDaysInMonth(): Int {
        val from = this.atDay(1)
        val to = this.atEndOfMonth()
        return countWorkDaysInPeriod(from, to)
    }

    fun LocalDate.countWorkDaysInMonth(): Int {
        val from = YearMonth.of(this.year, this.month).atDay(1)
        val to = YearMonth.of(this.year, this.month).atEndOfMonth()
        return countWorkDaysInPeriod(from, to)
    }
}
