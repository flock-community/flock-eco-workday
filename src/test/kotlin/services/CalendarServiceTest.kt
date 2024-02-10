package services

import community.flock.eco.workday.model.LeaveDay
import community.flock.eco.workday.model.LeaveDayType.HOLIDAY
import community.flock.eco.workday.model.Status.APPROVED
import community.flock.eco.workday.repository.LeaveDayRepository
import community.flock.eco.workday.services.CalendarService
import io.mockk.every
import io.mockk.mockk
import model.aPerson
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate

class CalendarServiceTest {
    private val leaveDayRepository = mockk<LeaveDayRepository>()
    private val calendarService = CalendarService(leaveDayRepository)

    @Test
    fun `Fetch holidays from repository and build calendar`() {
        val holidays =
            listOf(
                LeaveDay(
                    description = "description-1",
                    hours = 8.0,
                    person = aPerson(),
                    type = HOLIDAY,
                    status = APPROVED,
                    from = LocalDate.of(2023, 3, 3),
                    to = LocalDate.of(2023, 3, 4),
                ),
                LeaveDay(
                    description = "description-2",
                    hours = 8.0,
                    person = aPerson(),
                    type = HOLIDAY,
                    status = APPROVED,
                    from = LocalDate.of(2023, 3, 7),
                    to = LocalDate.of(2023, 3, 10),
                ),
            )

        every { leaveDayRepository.findAllByStatusAndType(APPROVED, HOLIDAY) }
            .returns(holidays)

        val result = calendarService.getCalendar()

        assertThat(result.events).hasSize(2)
    }
}
