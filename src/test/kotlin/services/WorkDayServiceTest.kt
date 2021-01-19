package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.helpers.CreateHelper
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
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@SpringBootTest(classes = [ApplicationConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class WorkDayServiceTest(
    @Autowired private val workDayService: WorkDayService,
    @Autowired private val createHelper: CreateHelper
) {

    @Test
    fun `creat update delete workday`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)

        val createForm = WorkDayForm(
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 50.0,
            sheets = listOf()
        )

        val created = workDayService.create(createForm)
        assertNotNull(created.id)
        assertEquals(50.0, created.hours)

        val updateForm = WorkDayForm(
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 25.0,
            sheets = listOf()
        )
        val updated = workDayService.update(created.code, updateForm)
        assertNotNull(updated.id)
        assertEquals(25.0, updated.hours)
        assertEquals(created.code, updated.code)

        assertNotNull(workDayService.findByCode(created.code))

        workDayService.deleteByCode(created.code)

        assertNull(workDayService.findByCode(created.code))
    }
}
