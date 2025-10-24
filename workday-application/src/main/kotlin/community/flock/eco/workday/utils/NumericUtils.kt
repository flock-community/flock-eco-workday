package community.flock.eco.workday.utils

import java.math.BigDecimal
import java.time.LocalDate

object NumericUtils {
    fun Iterable<BigDecimal>.sum(): BigDecimal =
        this
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur }

    fun Map<LocalDate, BigDecimal>.calculateRevenue(hourlyRate: Double): BigDecimal =
        this
            .map { BigDecimal("${it.value}").multiply(BigDecimal("$hourlyRate")) }
            .sum()
}
