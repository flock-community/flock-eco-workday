package community.flock.eco.workday.utils

import community.flock.eco.workday.model.Day
import java.time.LocalDate

fun convertDayOff(dayOff: List<Int>, from: LocalDate) = dayOff
    .mapIndexed { index, hours ->
        Day(
            date = from.plusDays(index.toLong()),
            hours = hours
        )
    }
    .toSet()
