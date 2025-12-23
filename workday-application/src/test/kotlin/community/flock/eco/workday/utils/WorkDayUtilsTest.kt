package community.flock.eco.workday.utils

import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.utils.toWorkWeeks
import io.mockk.mockk
import org.junit.jupiter.api.Test
import java.time.LocalDate
import kotlin.test.DefaultAsserter.assertEquals

class WorkDayUtilsTest {
    private val startDate = LocalDate.of(2023, 3, 1)
    private val endDate = LocalDate.of(2023, 3, 15)
    private val days = listOf(8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0, 8.0, 8.0, 0.0, 0.0, 8.0, 8.0, 8.0)
    private val workday =
        WorkDay(
            id = 0L,
            hours = 24.0,
            from = startDate,
            to = endDate,
            assignment = mockk<Assignment>(),
            days = days.toMutableList(),
            code = "test",
            sheets = listOf(),
            status = Status.REQUESTED,
        )

    @Test
    fun createWorkdayAndCheckData() {
        val weeks = workday.toWorkWeeks()
        val values = weeks.values.toList()
        assertEquals("amount of weeks", 3, weeks.size)
        assertEquals("total amount of days", 15, days.size)
        assertEquals("amount of days in 1st week", 5, values[0].size)
        assertEquals("amount of days in 2nd week", 7, values[1].size)
        assertEquals("amount of days in 3th week", 3, values[2].size)
    }
}
