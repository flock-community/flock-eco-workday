package community.flock.eco.workday.model

import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.workday.interfaces.Dayly
import community.flock.eco.workday.services.* // ktlint-disable no-wildcard-imports
import community.flock.eco.workday.utils.DateUtils
import community.flock.eco.workday.utils.DateUtils.isWorkingDay
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.Inheritance
import javax.persistence.InheritanceType

@Entity
@Inheritance(
    strategy = InheritanceType.JOINED
)
@EntityListeners(EventEntityListeners::class)
abstract class Day(

    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),

    override val hours: Double,

    @ElementCollection
    override val days: List<Double>? = null

) : Dayly, AbstractCodeEntity(id, code) {
    private fun getHoursPerDay(): Map<LocalDate, BigDecimal> =
        when (days.isNullOrEmpty()) {
            true -> {
                val workingDaysCount = BigDecimal(countWorkDaysInPeriod(from, to))
                    val hoursADay = BigDecimal(hours)
                        .divide(workingDaysCount, 10, RoundingMode.HALF_UP)
                this.toDateRange().associateWith {
                    when (it.isWorkingDay()) {
                        true -> hoursADay
                        false -> BigDecimal("0.0")
                    }
                }
            }
            false -> {
                this.toDateRange().mapIndexed { index, localDate ->
                    localDate to (days!![index]).toBigDecimal()
                }.toMap()
            }
        }

    fun hoursPerDayInPeriod(periodStart: LocalDate, periodEnd: LocalDate): Map<LocalDate, BigDecimal> {
        val days = getHoursPerDay()
        return DateUtils.dateRange(periodStart, periodEnd).associateWith {
            (days[it] ?: BigDecimal("0.0"))
        }
    }
}
