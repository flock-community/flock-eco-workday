package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.WorkDayService
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@Profile("local")
class LoadWorkDayData(
    loadPersonData: LoadPersonData,
    loadAssignmentData: LoadAssignmentData,
    private val workDayService: WorkDayService
) {
    val now = LocalDate.now()
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
        val now = LocalDate.now()
        loadAssignmentData.data
            .map { assignment ->
                (1..12)
                    .map {
                        WorkDayForm(
                            from = now.withMonth(it).withDayOfMonth(1),
                            to = now.withMonth(it).withDayOfMonth(1).plusDays(9),
                            hours = 80,
                            days = listOf(8, 8, 8, 8, 8, 8, 8, 8, 8, 8),
                            assignmentCode = assignment.code

                        )
                    }

            }
            .flatten()
            .forEach { it.create() }
    }
}