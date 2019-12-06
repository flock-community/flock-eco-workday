package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.services.SickdayService
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
                hours = 48,
                personId = it.id
            ).create()

            SickdayForm(
                description = "Healthy - ${it.firstname} ${it.lastname}",
                status = SickdayStatus.HEALTHY,
                hours = 24,
                personId = it.id
            ).create()
        }
    }
}
