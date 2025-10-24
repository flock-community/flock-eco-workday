package community.flock.eco.workday.services

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.services.AssignmentService
import community.flock.eco.workday.helpers.DataHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Pageable
import java.time.LocalDate
import javax.transaction.Transactional
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

@Transactional
class AssignmentServiceTest(
    @Autowired val assignmentService: AssignmentService,
    @Autowired val dataHelper: DataHelper,
) : WorkdayIntegrationTest() {
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

    @Test
    fun `when passing a date, find assigments with to date after`() {
        val to = LocalDate.of(2021, 12, 31)

        val data = dataHelper.createAssignmentData()

        val res = assignmentService.findAllByToAfterOrToNull(to, Pageable.ofSize(10))

        assertEquals(5, res.content.size)
        assertTrue(res.contains(data["in3"]))
        assertTrue(res.contains(data["in4"]))
        assertTrue(res.contains(data["in5"]))
        assertTrue(res.contains(data["in6"]))
        assertTrue(res.contains(data["out3"]))
        assertFalse(res.contains(data["in1"]))
        assertFalse(res.contains(data["in2"]))
        assertFalse(res.contains(data["out1"]))
        assertFalse(res.contains(data["out2"]))
    }
}
