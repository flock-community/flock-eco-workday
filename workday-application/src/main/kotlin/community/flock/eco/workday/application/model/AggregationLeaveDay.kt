package community.flock.eco.workday.application.model

import java.math.BigDecimal

data class AggregationLeaveDay(
    val name: String,
    val contractHours: BigDecimal,
    val plusHours: BigDecimal,
    val holidayHours: BigDecimal,
    val paidParentalLeaveHours: BigDecimal,
    val unpaidParentalLeaveHours: BigDecimal,
    val paidLeaveHours: BigDecimal,
)

data class PersonHolidayDetails(
    val name: String,
    val holidayHoursFromContract: BigDecimal,
    val plusHours: BigDecimal,
    val holidayHoursDone: BigDecimal,
    val holidayHoursApproved: BigDecimal,
    val holidayHoursRequested: BigDecimal,
) {
    val totalHoursAvailable: BigDecimal
    val totalHoursUsed: BigDecimal
    val totalHoursRemaining: BigDecimal

    init {
        totalHoursAvailable = this.holidayHoursFromContract + this.plusHours
        totalHoursUsed = this.holidayHoursDone + this.holidayHoursApproved
        totalHoursRemaining = totalHoursAvailable - totalHoursUsed
    }
}
