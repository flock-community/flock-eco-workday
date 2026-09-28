package community.flock.eco.workday.domain.common

/** Paid by the hour: an hourly rate and the number of hours a week the rate applies to. */
interface Hourly {
    val hourlyRate: Double
    val hoursPerWeek: Int
}
