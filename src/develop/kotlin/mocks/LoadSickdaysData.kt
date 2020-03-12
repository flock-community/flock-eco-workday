package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.services.SickDayService
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@Profile("local")
class LoadSickdaysData(
    loadPersonData: LoadPersonData,
    private val service: SickDayService
) {
    val data: MutableSet<SickDay> = mutableSetOf()

    /**
     * add a create() function to the SickdayForm which calls the create function of SickdayService
     * to create and persist the Sickday.
     */
    private final fun SickDayForm.create() {
        service.create(this)
    }

    /**
     * Initialize a Sickday with status SickdayStatus.SICK (which is the default)
     * and one Sickday with status SickdayStatus.HEALTHY (to indicate a past Sickday)
     */
    init {
        loadPersonData.data.forEach {
            SickDayForm(
                from = LocalDate.of(2019, 4, 4),
                to = LocalDate.of(2019, 4, 9),
                days = listOf(8, 8, 8, 8, 8, 8),
                hours = 48,
                personCode = it.code
            ).create()

            SickDayForm(
                from = LocalDate.of(2019, 4, 4),
                to = LocalDate.of(2019, 4, 9),
                days = listOf(8, 8, 8, 8, 8, 8),
                hours = 48,
                personCode = it.code
            ).run {
                service.create(this)
            }
        }
    }
}
