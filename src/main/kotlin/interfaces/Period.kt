package community.flock.eco.workday.interfaces

import community.flock.eco.workday.model.*
import community.flock.eco.workday.utils.DateUtils.countWorkDaysInMonth
import community.flock.eco.workday.utils.DateUtils.dateRange
import community.flock.eco.workday.utils.DateUtils.filterInPeriod
import community.flock.eco.workday.utils.DateUtils.toDateRange
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

interface Period {
    val from: LocalDate
    val to: LocalDate?

    fun toDateRange() = dateRange(this.from, this.to)

    fun amountPerWorkingDay(month: YearMonth) = when (this) {
        is ContractInternal ->
            this.monthlySalary.toBigDecimal()
                .divide(month.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
        is ContractExternal ->
            (this.hourlyRate * this.hoursPerWeek).toBigDecimal()
                .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
        is ContractManagement ->
            this.monthlyFee.toBigDecimal()
                .divide(month.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
        is ContractService ->
            this.monthlyCosts.toBigDecimal()
                .divide(month.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
        is Assignment ->
            (this.hourlyRate * this.hoursPerWeek).toBigDecimal()
                .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
        is WorkDay ->
            (this.assignment.hourlyRate * this.assignment.hoursPerWeek).toBigDecimal()
                .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
        else -> error("Cannot get amount per working day")
    }

    fun betweenRange(period: Period) = this
        .let { it.from <= period.to && it.to?.let { to -> to >= period.from } ?: true }

    fun toDateRangeInPeriod(from: LocalDate, to: LocalDate) = dateRange(from, to)
        .filterInPeriod(this)

    fun toDateRangeInPeriod(yearMonth: YearMonth) = yearMonth
        .toDateRange()
        .filterInPeriod(this)

    fun toDateRangeInPeriod(period: Period) = period.toDateRange()
        .filterInPeriod(this)

    fun countDays() = ChronoUnit.DAYS.between(this.from, this.to) + 1
}

fun <T : Period> Iterable<T>.filterInRange(date: LocalDate) = this
    .filter { it.inRange(date) }

fun Period.inRange(date: LocalDate) = this
    .let { it.from <= date && it.to?.let { to -> to >= date } ?: true }
