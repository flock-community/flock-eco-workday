package community.flock.eco.holidays.model

import community.flock.eco.feature.user.model.User
import java.time.LocalDate

data class HolidayForm (

        val id: Long = 0,
        val name: String,
        val fromDate: LocalDate,
        val toDate: LocalDate
) {
    fun createHoliday(holidayForm: HolidayForm, user: User) : Holiday = Holiday(
            name = holidayForm.name,
            fromDate= holidayForm.fromDate,
            toDate = holidayForm.toDate,
            user = user)
    fun updateHoliday(user: User) : Holiday = Holiday(id, name, fromDate, toDate, user)
}