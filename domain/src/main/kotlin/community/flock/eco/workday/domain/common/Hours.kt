package community.flock.eco.workday.domain.common

/**
 * Hours booked over a period: the total, and optionally how that total is spread over the days
 * of the period, one entry per day from the first day to the last. Without [days] the total is
 * spread evenly.
 */
interface Hours {
    val hours: Double
    val days: List<Double>?
}
