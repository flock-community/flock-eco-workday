package community.flock.eco.workday.application.common.model

import community.flock.eco.workday.application.common.util.DateUtils
import community.flock.eco.workday.application.common.util.DateUtils.filterInPeriod
import community.flock.eco.workday.application.common.util.DateUtils.toDateRange
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

interface Period {
    val from: LocalDate
    val to: LocalDate?

    fun toDateRange() = DateUtils.dateRange(this.from, this.to)

    /** What one working day of this period costs or yields in [month]; periods that carry an amount override it. */
    fun amountPerWorkingDay(month: YearMonth): BigDecimal = error("Cannot get amount per working day")

    fun betweenRange(period: Period) =
        this
            .let { it.from <= period.to && it.to?.let { to -> to >= period.from } ?: true }

    fun toDateRangeInPeriod(
        from: LocalDate,
        to: LocalDate,
    ) = DateUtils
        .dateRange(from, to)
        .filterInPeriod(this)

    fun toDateRangeInPeriod(yearMonth: YearMonth) =
        yearMonth
            .toDateRange()
            .filterInPeriod(this)

    fun toDateRangeInPeriod(period: Period) =
        period
            .toDateRange()
            .filterInPeriod(this)

    fun countDays() = ChronoUnit.DAYS.between(this.from, this.to) + 1
}

fun <T : Period> Iterable<T>.filterInRange(date: LocalDate) =
    this
        .filter { it.inRange(date) }

fun Period.inRange(date: LocalDate) =
    this
        .let { it.from <= date && it.to?.let { to -> to >= date } ?: true }

data class FromToPeriod(
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),
) : Period
