package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.WorkDayService
import java.time.LocalDate
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@Profile("local")
class LoadWorkDayData(
    loadPersonData: LoadPersonData,
    loadAssignmentData: LoadAssignmentData,
    private val workDayService: WorkDayService
) {
    val data: MutableSet<WorkDay> = mutableSetOf()

    /**
     * add a create() function to the WorkDayForm which calls the create function of WorkDayService
     * to create and persist the Workday.
     */
    private final fun WorkDayForm.create() {
        workDayService.create(this)
    }

    /**
     * Initialize a Sickday with status SickdayStatus.SICK (which is the default)
     * and one Sickday with status SickdayStatus.HEALTHY (to indicate a past Sickday)
     */
    init {
        loadAssignmentData.data.forEach {
            WorkDayForm(
                from = LocalDate.of(2019, 4, 4),
                to = LocalDate.of(2019, 4, 9),
                hours = 40,
                days = listOf(0, 8, 8, 8, 8, 8),
                assignmentCode = it.code

            ).create()
        }
    }
}
