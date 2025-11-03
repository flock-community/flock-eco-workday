package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.forms.WorkDaySheetForm
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.services.WorkDayService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadWorkDayData(
    private val loadData: LoadData,
    private val workDayService: WorkDayService,
    loadAssignmentData: LoadAssignmentData,
) {
    val now: LocalDate = LocalDate.now()
    val data: MutableSet<WorkDay> = mutableSetOf()

    /**
     * add a create() function to the WorkDayForm which calls the create function of WorkDayService
     * to create and persist the Workday.
     */
    private final fun WorkDayForm.create() {
        loadData.loadWhenEmpty {
            workDayService.create(this)
        }
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
                            hours = 80.0,
                            days = listOf(8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0),
                            assignmentCode = assignment.code,
                            sheets =
                                listOf(
                                    WorkDaySheetForm(
                                        name = "File1.jpg",
                                        file = UUID.randomUUID(),
                                    ),
                                    WorkDaySheetForm(
                                        name = "File2.pdf",
                                        file = UUID.randomUUID(),
                                    ),
                                ),
                        )
                    }
            }
            .flatten()
            .forEach { it.create() }
    }
}
