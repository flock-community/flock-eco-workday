package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.services.HolidayService
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
class LoadHolidayData(
        private val loadUserData: LoadUserData,
        private val holidayService: HolidayService
) {
    init {
        loadUserData.users.forEach {
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
