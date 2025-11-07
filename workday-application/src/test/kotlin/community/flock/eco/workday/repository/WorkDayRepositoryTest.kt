package community.flock.eco.workday.repository

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.repository.WorkDayRepository
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import kotlin.test.assertNotNull

class WorkDayRepositoryTest(
    @Autowired private val repository: WorkDayRepository,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    @Test
    fun `expect workday to be created for an assignment`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)

        val workDay =
            WorkDay(
                assignment = assignment,
                from = from,
                to = LocalDate.of(2020, 1, 31),
                hours = 10.0,
                status = Status.REQUESTED,
                sheets = listOf(),
            )
        val res = repository.save(workDay)

        assertNotNull(res.id)
    }
}
