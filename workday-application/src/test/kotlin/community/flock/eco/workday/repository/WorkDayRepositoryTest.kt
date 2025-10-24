package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.config.AppTestConfig
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import java.time.LocalDate
import javax.transaction.Transactional
import kotlin.test.assertNotNull

@SpringBootTest(classes = [ApplicationConfiguration::class, AppTestConfig::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class WorkDayRepositoryTest(
    @Autowired private val repository: WorkDayRepository,
    @Autowired private val createHelper: CreateHelper,
) {
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
