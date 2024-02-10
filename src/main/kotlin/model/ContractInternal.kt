package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Monthly
import community.flock.eco.workday.interfaces.Period
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
data class ContractInternal(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),
    override val person: Person,
    override val from: LocalDate,
    override val to: LocalDate? = null,
    override val monthlySalary: Double,
    override val hoursPerWeek: Int,
    val holidayHours: Int,
    val billable: Boolean = true,
) : Monthly, Contract(id, code, from, to, person, ContractType.INTERNAL) {
    override fun totalCostsInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        return totalCostInPeriod(from, to, monthlySalary)
    }

    override fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        return totalDaysInPeriod(from, to, hoursPerWeek)
    }

    override fun equals(other: Any?) = super.equals(other)

    override fun hashCode(): Int = super.hashCode()

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal =
        this
            .toDateRangeInPeriod(yearMonth)
            .map { this.monthlySalary.toBigDecimal() }
            .sum()
            .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)

    fun totalLeaveDayHoursInPeriod(period: Period): BigDecimal =
        this
            .toDateRangeInPeriod(period)
            .sumOf { this.holidayHours }
            .toBigDecimal()
            .divide(period.countDays().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
