package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.services.HoliDayService
import java.time.LocalDate
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadHolidayData(
    loadPersonData: LoadPersonData,
    private val holiDayService: HoliDayService
) {
    init {
        loadPersonData.data.forEach {
            HoliDayForm(
                    description = "Test holiday ${it.firstname}",
                    from = LocalDate.of(2019, 4, 4),
                    to = LocalDate.of(2019, 4, 9),
                    days = listOf(8, 8, 8, 8, 8, 8),
                    hours = 48,
                    personCode = it.code
            ).create()
        }
    }

    fun HoliDayForm.create() {
        holiDayService.create(this)
    }
}
