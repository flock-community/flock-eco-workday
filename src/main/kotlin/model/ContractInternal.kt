package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Monthly
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.utils.DateUtils
import community.flock.eco.workday.utils.NumericUtils.sum
import java.math.BigDecimal
import java.math.BigInteger
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.*
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class ContractInternal(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val person: Person,

    override val from: LocalDate,
    override val to: LocalDate? = null,

    override val monthlySalary: Double,
    override val hoursPerWeek: Int,

    val holidayHours: Int,
    val billable: Boolean = true

) : Monthly, Contract(id, code, from, to, person, ContractType.INTERNAL) {
    override fun totalCostsInPeriod(from: LocalDate, to: LocalDate): BigDecimal {
        var monthLengthSum = 0
        val dateRangeContract = DateUtils.dateRange(this.from, this.to ?:
        LocalDate.of(to.year, to.month, to.month.length(to.isLeapYear)))

        val unionDateRange = DateUtils.dateRange(from, to)
            .intersect(dateRangeContract.toSet())

        val yearMonthsInRange = unionDateRange.map { YearMonth.of(it.year, it.month) }.distinct()
        val daysInMonth = yearMonthsInRange.sumOf { yearMonth ->
            monthLengthSum += yearMonth.month.length(yearMonth.isLeapYear)
            unionDateRange
                .count { it.year == yearMonth.year && it.month == yearMonth.month }
                .toBigDecimal()
        }

        return if(daysInMonth.toDouble() == 0.0) {
            BigDecimal(BigInteger.ZERO)
        } else {
            val averageDaysInMonths = monthLengthSum.toBigDecimal()
                .divide(yearMonthsInRange.count().toBigDecimal(), 10, RoundingMode.HALF_UP)
            daysInMonth
                .times(this.monthlySalary.toBigDecimal())
                .divide(averageDaysInMonths, 10, RoundingMode.HALF_UP)
        }
    }

    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal = this
        .toDateRangeInPeriod(yearMonth)
        .map { this.monthlySalary.toBigDecimal() }
        .sum()
        .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)

    fun totalHolidayHoursInPeriod(period: Period): BigDecimal = this
        .toDateRangeInPeriod(period)
        .sumOf { this.holidayHours }
        .toBigDecimal()
        .divide(period.countDays().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
