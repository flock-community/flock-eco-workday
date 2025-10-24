package community.flock.eco.workday.model

import java.math.BigDecimal

data class AggregationHackDay(
    val name: String,
    val contractHours: BigDecimal,
    val usedHours: BigDecimal,
)

data class PersonHackdayDetails(
    val name: String,
    val hackHoursFromContract: BigDecimal,
    val hackHoursUsed: BigDecimal,
) {
    val totalHoursRemaining: BigDecimal = hackHoursFromContract - hackHoursUsed
}
