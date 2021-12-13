package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.workday.interfaces.Hourly
import community.flock.eco.workday.services.countWorkDaysInPeriod
import community.flock.eco.workday.utils.DateUtils
import community.flock.eco.workday.utils.DateUtils.isWorkingDay
import community.flock.eco.workday.utils.NumericUtils.sum
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners

@Entity
@EntityListeners(EventEntityListeners::class)
data class ContractExternal(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val person: Person,

    override val from: LocalDate,
    override val to: LocalDate? = null,

    override val hourlyRate: Double,
    override val hoursPerWeek: Int,

    val billable: Boolean = true

) : Hourly, Contract(id, code, from, to, person, ContractType.EXTERNAL) {
    override fun totalCostsInPeriod(from: LocalDate, to: LocalDate): BigDecimal {
        val dateRange = DateUtils.dateRange(from, to)
        val dateRangeContract = DateUtils.dateRange(this.from, this.to
            ?: LocalDate.of(to.year, to.month, to.month.length(to.isLeapYear)))

        val hoursPerDay = hoursPerWeek.toBigDecimal().divide(BigDecimal("5.0"), 10, RoundingMode.HALF_UP)
        return dateRange.intersect(dateRangeContract.toSet()).map {
            when (it.isWorkingDay()) {
                true -> hoursPerDay
                false -> BigDecimal("0.0")
            }
        }.sum().times(hourlyRate.toBigDecimal())
    }

    override fun equals(obj: Any?) = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()
}
