package community.flock.eco.workday.application.interfaces

import community.flock.eco.workday.application.utils.DateUtils.toPeriod
import community.flock.eco.workday.application.utils.NumericUtils.sum
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

interface Daily :
    Hours,
    Period {
    fun totalHoursInPeriod(yearMonth: YearMonth): BigDecimal =
        this
            .totalHoursInPeriod(yearMonth.toPeriod())

    fun totalHoursInPeriod(period: Period): BigDecimal {
        val hours = this.hoursPerDay()
        return period
            .toDateRange()
            .mapNotNull { hours[it] }
            .sum()
    }

    fun hoursPerDay(): Map<LocalDate, BigDecimal> {
        val dateRange = this.toDateRange()
        // days can round-trip shorter than the range; an even spread then avoids an out-of-bounds index
        val positionalDays = this.days?.takeIf { it.size == dateRange.size }
        val evenHoursPerDay =
            this.hours
                .toBigDecimal()
                .divide(this.countDays().toBigDecimal(), 100, RoundingMode.HALF_UP)
        return dateRange
            .mapIndexed { index, localDate ->
                localDate to (positionalDays?.get(index)?.toBigDecimal() ?: evenHoursPerDay)
            }.toMap()
    }
}

fun <T : Daily> T.validate(): T =
    apply {
        if (this.hours < 0) {
            error("Hours cannot have negative value")
        }
        if (this.days?.any { it < 0 } == true) {
            error("Days cannot have negative value")
        }

        val daysBetween = ChronoUnit.DAYS.between(this.from, this.to) + 1
        if (this.days != null) {
            if (this.days?.size?.toLong() != daysBetween) {
                error("amount of days ($daysBetween) not equal to period (${this.days?.size})")
            }
            if (this.days?.sum() != this.hours) {
                error("Total hour does not match")
            }
        }
    }
