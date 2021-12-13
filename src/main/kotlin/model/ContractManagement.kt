package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.utils.DateUtils
import community.flock.eco.workday.utils.NumericUtils.sum
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class ContractManagement(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val person: Person,

    override val from: LocalDate,
    override val to: LocalDate? = null,

    val monthlyFee: Double

) : Contract(id, code, from, to, person, ContractType.MANAGEMENT) {

    //TODO duplicate so move to 1 function and call it with salary?
    override fun totalCostsInPeriod(from: LocalDate, to: LocalDate): BigDecimal {
        val dateRange = DateUtils.dateRange(from, to)
        val dateRangeContract = DateUtils.dateRange(this.from, this.to ?:
        LocalDate.of(to.year, to.month, to.month.length(to.isLeapYear)))
        val unionDateRange = dateRange.intersect(dateRangeContract.toSet())
        val yearMonthsInRange = dateRange.map { YearMonth.of(it.year, it.month) }.distinct()
        return yearMonthsInRange.map { yearMonth ->
            val daysInMonth = unionDateRange.count { it.year == yearMonth.year && it.month == yearMonth.month }.toBigDecimal()
            val monthLength = yearMonth.month.length(yearMonth.isLeapYear).toBigDecimal()
            val monthlySalary = monthlyFee.toBigDecimal()
            daysInMonth.divide(monthLength, 10, RoundingMode.HALF_UP)
                .times(monthlySalary)
        }.sum()
    }

    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal = this
        .toDateRangeInPeriod(yearMonth)
        .map { this.monthlyFee.toBigDecimal() }
        .sum()
        .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
