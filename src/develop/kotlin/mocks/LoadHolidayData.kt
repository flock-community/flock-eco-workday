package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.model.HolidayType
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.HoliDayService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadHolidayData(
    loadPersonData: LoadPersonData,
    private val holiDayService: HoliDayService
) {

    final val now: LocalDate = LocalDate.now().withDayOfYear(1).withDayOfMonth(1)

    init {
        loadPersonData.data.forEach {
            createHolidays(it)
            createPlusDays(it)
        }
    }

    private fun createHolidays(it: Person) {
        for (i in 0 until 10) {
            val random = (0..200).random().toLong()
            HoliDayForm(
                description = "Test holiday ${it.firstname}",
                from = now.plusYears(i.toLong()).plusDays(random),
                to = now.plusYears(i.toLong()).plusDays(random + 5),
                days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                hours = 48.0,
                personId = it.uuid
            ).create()
        }
    }

    private fun createPlusDays(it: Person) {
        for (i in 0 until 10 step 3) {
            val random = (0..200).random().toLong()
            val date = now.plusYears(i.toLong()).plusDays(random)

            HoliDayForm(
                type = HolidayType.PLUSDAY,
                description = "Plus day ${it.firstname}",
                from = date,
                to = date,
                days = listOf(8.0),
                hours = 8.0,
                personId = it.uuid
            ).create()
        }
    }

    fun HoliDayForm.create() {
        holiDayService.create(this)
    }
}
