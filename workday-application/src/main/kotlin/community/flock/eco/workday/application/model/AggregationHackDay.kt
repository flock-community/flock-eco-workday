package community.flock.eco.workday.application.model

import java.math.BigDecimal

data class AggregationHackDay(
    val name: String,
    val contractHours: BigDecimal,
    val usedHours: BigDecimal,
    val holidayOnHackDayHours: BigDecimal = BigDecimal.ZERO,
    val sickOnHackDayHours: BigDecimal = BigDecimal.ZERO,
)

data class PersonHackdayDetails(
    val name: String,
    val hackHoursFromContract: BigDecimal,
    val hackHoursUsed: BigDecimal,
    // Hack days missed through holiday or sickness still cost budget.
    val holidayOnHackDayHours: BigDecimal = BigDecimal.ZERO,
    val sickOnHackDayHours: BigDecimal = BigDecimal.ZERO,
) {
    val totalHoursRemaining: BigDecimal =
        hackHoursFromContract - hackHoursUsed - holidayOnHackDayHours - sickOnHackDayHours
}
