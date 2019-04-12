package community.flock.eco.holidays.model

import java.time.LocalDate

data class HolidayForm (

        val id: Long = 0,
        val fromDate: LocalDate,
        val toDate: LocalDate
) {
    fun createHoliday() : Holiday = Holiday(0, fromDate, toDate)
    fun updateHoliday() : Holiday = Holiday(id, fromDate, toDate)
}