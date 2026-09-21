package community.flock.eco.workday.domain.common

/** Paid by the month: a monthly salary and the number of hours a week that salary covers. */
interface Monthly {
    val monthlySalary: Double
    val hoursPerWeek: Int
}
