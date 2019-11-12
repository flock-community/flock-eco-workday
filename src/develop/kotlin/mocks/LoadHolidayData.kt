package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.services.HolidayService
import java.time.LocalDate
import org.springframework.stereotype.Component

@Component
class LoadHolidayData(
        private val loadUserData: LoadUserData,
        private val holidayService: HolidayService
) {
    init {
        loadUserData.data.forEach {
            HolidayForm(
                    description = "Test holiday",
                    from = LocalDate.of(2019, 4, 4),
                    to = LocalDate.of(2019, 4, 9),
                    days = listOf(8, 8, 8, 8, 8, 8),
                    userCode = it.code
            ).create()

        }
    }

    fun HolidayForm.create() {
        holidayService.create(this)
    }
}
