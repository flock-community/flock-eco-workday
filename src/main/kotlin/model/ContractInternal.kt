package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Monthly
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.utils.DateUtils
import community.flock.eco.workday.utils.NumericUtils.sum
import java.math.BigDecimal
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
        val dateRange = DateUtils.dateRange(from, to)
        val dateRangeContract = DateUtils.dateRange(this.from, this.to ?:
        LocalDate.of(to.year, to.month, to.month.length(to.isLeapYear)))
        val unionDateRange = dateRange.intersect(dateRangeContract.toSet())
        val yearMonthsInRange = dateRange.map { YearMonth.of(it.year, it.month) }.distinct()
        return yearMonthsInRange.map { yearMonth ->
            val daysInMonth = unionDateRange.count { it.year == yearMonth.year && it.month == yearMonth.month }.toBigDecimal()
            val monthLength = yearMonth.month.length(yearMonth.isLeapYear).toBigDecimal()
            val monthlySalary = monthlySalary.toBigDecimal()
            daysInMonth.divide(monthLength, 10, RoundingMode.HALF_UP)
                .times(monthlySalary)
        }.sum()
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
