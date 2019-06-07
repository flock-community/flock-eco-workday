package community.flock.eco.holidays.model

import community.flock.eco.feature.user.model.User
import java.time.LocalDate
import java.time.LocalDateTime

data class HolidayForm(

        val id: Long = 0,
        val name: String,
        val fromDate: LocalDateTime,
        val toDate: LocalDateTime
) {
    fun createHoliday(user: User): Holiday = Holiday(
            name = this.name,
            fromDate = this.fromDate,
            toDate = this.toDate,
            user = user)

    fun updateHoliday(user: User): Holiday = Holiday(id, name, fromDate, toDate, user)
}