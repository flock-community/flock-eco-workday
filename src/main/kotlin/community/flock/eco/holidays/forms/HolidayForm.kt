package community.flock.eco.holidays.forms

import java.time.LocalDate

data class HolidayForm(

        val description: String?,
        val from: LocalDate,
        val to: LocalDate,
        val dayOff: Array<Int>
)
