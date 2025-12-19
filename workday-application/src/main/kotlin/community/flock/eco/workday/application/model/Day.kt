package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.interfaces.Dayly
import community.flock.eco.workday.application.services.countWorkDaysInPeriod
import community.flock.eco.workday.application.utils.DateUtils
import community.flock.eco.workday.application.utils.DateUtils.isWorkingDay
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID

@Entity
@Inheritance(
    strategy = InheritanceType.JOINED,
)
@EntityListeners(EventEntityListeners::class)
abstract class Day(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),
    override val hours: Double,
    @ElementCollection(fetch = FetchType.EAGER)
    override val days: MutableList<Double>? = null,
) : Dayly, AbstractCodeEntity(id, code) {
    private fun getHoursPerDay(): Map<LocalDate, BigDecimal> =
        when (days.isNullOrEmpty()) {
            true -> {
                val workingDaysCount = BigDecimal(countWorkDaysInPeriod(from, to))
                val hoursADay =
                    BigDecimal(hours)
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

    fun hoursPerDayInPeriod(
        periodStart: LocalDate,
        periodEnd: LocalDate,
    ): Map<LocalDate, BigDecimal> {
        val days = getHoursPerDay()
        return DateUtils.dateRange(periodStart, periodEnd).associateWith {
            (days[it] ?: BigDecimal("0.0"))
        }
    }
}
