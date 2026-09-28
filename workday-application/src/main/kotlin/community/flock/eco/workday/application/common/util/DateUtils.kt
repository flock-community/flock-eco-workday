package community.flock.eco.workday.application.common.util

import community.flock.eco.workday.application.common.model.FromToPeriod
import community.flock.eco.workday.application.common.model.Period
import community.flock.eco.workday.application.common.util.DateUtils.isWorkingDay
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit

object DateUtils {
    // TODO Dit gaat niet werken wanneer 'to' null is throw exception
    fun dateRange(
        from: LocalDate,
        to: LocalDate?,
    ) = (0..ChronoUnit.DAYS.between(from, to))
        .map { from.plusDays(it) }

    fun LocalDate.isWorkingDay() =
        listOf(
            DayOfWeek.MONDAY,
            DayOfWeek.TUESDAY,
            DayOfWeek.WEDNESDAY,
            DayOfWeek.THURSDAY,
            DayOfWeek.FRIDAY,
        ).contains(this.dayOfWeek)

    fun YearMonth.toDateRange() = dateRange(this.atDay(1), this.atEndOfMonth())

    fun YearMonth.toPeriod() = FromToPeriod(this.atDay(1), this.atEndOfMonth())

    fun List<LocalDate>.filterInPeriod(period: Period) =
        this
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

    val humanReadableDateFormat: DateTimeFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy")

    fun LocalDate.toHumanReadable(): String = format(humanReadableDateFormat)
}

fun countWorkDaysInPeriod(
    from: LocalDate,
    to: LocalDate,
): Int {
    val diff = ChronoUnit.DAYS.between(from, to)
    return (0..diff)
        .map { from.plusDays(it) }
        .filter { it.isWorkingDay() }
        .count()
}
