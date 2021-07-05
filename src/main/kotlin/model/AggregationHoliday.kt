package community.flock.eco.workday.model

import java.math.BigDecimal

data class AggregationHoliday(
    val name: String,
    val contractHours: BigDecimal,
    val plusHours: BigDecimal,
    val holidayHours: BigDecimal,
)
