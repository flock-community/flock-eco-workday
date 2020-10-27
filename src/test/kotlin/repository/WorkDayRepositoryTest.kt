package community.flock.eco.workday.repository

import community.flock.eco.workday.Application
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import java.time.LocalDate
import javax.transaction.Transactional
import kotlin.test.assertNotNull

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureTestDatabase
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
@Transactional
class WorkDayRepositoryTest {

    @Autowired
    private lateinit var repository: WorkDayRepository

    @Autowired
    private lateinit var createHelper: CreateHelper

    lateinit var person: Person

    @Test
    fun `expect workday to be created for an assignment`() {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)

        val workDay = WorkDay(
            assignment = assignment,
            from = from,
            to = LocalDate.of(2020, 1, 31),
            hours = 10.0,
            status = Status.REQUESTED,
            sheets = listOf()
        )
        val res = repository.save(workDay)

        assertNotNull(res.id)
    }
}
