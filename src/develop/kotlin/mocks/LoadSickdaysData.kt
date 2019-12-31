package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.services.SickdayService
import java.time.LocalDate
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadSickdaysData(
    loadPersonData: LoadPersonData,
    private val service: SickdayService
) {
    val data: MutableSet<Sickday> = mutableSetOf()

    /**
     * add a create() function to the SickdayForm which calls the create function of SickdayService
     * to create and persist the Sickday.
     */
    private final fun SickdayForm.create() {
        service.create(this)
    }

    /**
     * Initialize a Sickday with status SickdayStatus.SICK (which is the default)
     * and one Sickday with status SickdayStatus.HEALTHY (to indicate a past Sickday)
     */
    init {
        loadPersonData.data.forEach {
            SickdayForm(
                description = "Sick - ${it.firstname} ${it.lastname}",
                status = SickdayStatus.SICK,
                from = LocalDate.of(2019, 4, 4),
                to = LocalDate.of(2019, 4, 9),
                days = listOf(8, 8, 8, 8, 8, 8),
                hours = 48,
                personCode = it.code
            ).create()

            SickdayForm(
                description = "Healthy - ${it.firstname} ${it.lastname}",
                status = SickdayStatus.HEALTHY,
                from = LocalDate.of(2019, 4, 4),
                to = LocalDate.of(2019, 4, 9),
                days = listOf(8, 8, 8, 8, 8, 8),
                hours = 24,
                personCode = it.code
            ).run {
                val sickday = service.create(this)
                service.update(sickday.code, this)
            }
        }
    }
}
