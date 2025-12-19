package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.interfaces.Monthly
import community.flock.eco.workday.application.interfaces.Period
import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.core.events.EventEntityListeners
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class ContractInternal(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    person: Person,
    from: LocalDate,
    to: LocalDate? = null,
    override val monthlySalary: Double,
    override val hoursPerWeek: Int,
    val holidayHours: Int,
    val hackHours: Int,
    val billable: Boolean = true,
) : Monthly, Contract(id, code, from, to, person, ContractType.INTERNAL) {
    init {
        require(person != null) {
            "Internal contracts must have a person"
        }
    }

    override fun totalCostsInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal = totalCostInPeriod(from, to, monthlySalary)

    override fun totalDaysInPeriod(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal = totalDaysInPeriod(from, to, hoursPerWeek)

    fun totalCostInPeriod(yearMonth: YearMonth): BigDecimal =
        toDateRangeInPeriod(yearMonth)
            .map { monthlySalary.toBigDecimal() }
            .sum()
            .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)

    fun totalLeaveDayHoursInPeriod(period: Period): BigDecimal =
        this.toDateRangeInPeriod(period)
            .sumOf { this.holidayHours }
            .toBigDecimal()
            .divide(period.countDays().toBigDecimal(), 10, RoundingMode.HALF_UP)

    fun totalHackDayHoursInPeriod(period: Period): BigDecimal =
        this.toDateRangeInPeriod(period)
            .sumOf { this.hackHours }
            .toBigDecimal()
            .divide(period.countDays().toBigDecimal(), 10, RoundingMode.HALF_UP)
}
