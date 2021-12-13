package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.utils.DateUtils
import community.flock.eco.workday.utils.NumericUtils.sum
import java.math.BigDecimal
import java.math.BigInteger
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
                .times(this.monthlyFee.toBigDecimal())
                .divide(averageDaysInMonths, 10, RoundingMode.HALF_UP)
        }
    }

    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal = this
        .toDateRangeInPeriod(yearMonth)
        .map { this.monthlyFee.toBigDecimal() }
        .sum()
        .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
