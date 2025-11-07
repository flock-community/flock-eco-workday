package community.flock.eco.workday.utils

import java.time.LocalDate

/**
 * day generator
 * create a day from LocalDate by passing the day
 * @param day the amount of days. If no day is passed it will be set to day 1
 */
fun dayFromLocalDate(day: Int? = null): LocalDate = LocalDate.of(1970, 1, day ?: 1)
