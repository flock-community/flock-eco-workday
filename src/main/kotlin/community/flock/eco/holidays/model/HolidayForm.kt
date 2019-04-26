package community.flock.eco.holidays.model

import java.time.LocalDate

data class HolidayForm (

        val id: Long = 0,
        val name: String,
        val fromDate: LocalDate,
        val toDate: LocalDate
) {
    fun createHoliday(holidayForm: HolidayForm) : Holiday = Holiday(0, holidayForm.name, holidayForm.fromDate, holidayForm.toDate)
    fun updateHoliday() : Holiday = Holiday(id, name, fromDate, toDate)
}