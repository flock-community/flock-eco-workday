package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

class WorkDayServiceIntegrationTest(
    @Autowired private val workDayService: WorkDayService,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    @Test
    fun `Create, update and delete work day`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)

        val createForm =
            WorkDayForm(
                from = from,
                to = to,
                assignmentCode = assignment.code,
                hours = 50.0,
                sheets = listOf(),
            )

        val created = workDayService.create(createForm)
        assertNotNull(created.id)
        assertEquals(50.0, created.hours)

        val updateForm =
            WorkDayForm(
                from = from,
                to = to,
                assignmentCode = assignment.code,
                hours = 25.0,
                sheets = listOf(),
            )
        val updated =
            workDayService.update(
                workDayCode = created.code,
                form = updateForm,
                isUpdatedByOwner = false,
            )
        assertNotNull(updated.id)
        assertEquals(25.0, updated.hours)
        assertEquals(created.code, updated.code)

        assertNotNull(workDayService.findByCode(created.code))

        workDayService.deleteByCode(created.code)

        assertNull(workDayService.findByCode(created.code))
    }
}
