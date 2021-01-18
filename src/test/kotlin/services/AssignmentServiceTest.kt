package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.helpers.DataHelper
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
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@SpringBootTest(classes = [ApplicationConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class, DataHelper::class)
@ActiveProfiles(profiles = ["test"])
class AssignmentServiceTest(
    @Autowired val assignmentService: AssignmentService,
    @Autowired val dataHelper: DataHelper
) {

    @Test
    fun `find all active assignments`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val data = dataHelper.createAssignmentData()

        val res = assignmentService.findAllActive(from, to)

        assertEquals(6, res.size)
        assertTrue(res.contains(data["in1"]))
        assertTrue(res.contains(data["in2"]))
        assertTrue(res.contains(data["in3"]))
        assertTrue(res.contains(data["in4"]))
        assertTrue(res.contains(data["in5"]))
        assertTrue(res.contains(data["in6"]))
        assertFalse(res.contains(data["out1"]))
        assertFalse(res.contains(data["out2"]))
        assertFalse(res.contains(data["out3"]))
    }
}
