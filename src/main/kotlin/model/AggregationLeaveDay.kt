package community.flock.eco.workday.model

import java.math.BigDecimal

data class AggregationLeaveDay(
    val name: String,
    val contractHours: BigDecimal,
    val plusHours: BigDecimal,
    val holidayHours: BigDecimal,
    val paidParentalLeaveHours: BigDecimal,
    val unpaidParentalLeaveHours: BigDecimal,
)
