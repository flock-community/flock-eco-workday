package community.flock.eco.workday.aggregation

data class PersonAggregate(
    val revenuePerHour: Double,
    val costPerHour: Double,
    val totalHoliDays: Double,
    val totalSickDays: Double
)
