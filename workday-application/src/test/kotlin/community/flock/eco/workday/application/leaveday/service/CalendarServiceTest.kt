package community.flock.eco.workday.application.leaveday.service

import community.flock.eco.workday.application.leaveday.model.LeaveDay
import community.flock.eco.workday.application.leaveday.model.LeaveDayType.HOLIDAY
import community.flock.eco.workday.application.leaveday.persistence.LeaveDayRepository
import community.flock.eco.workday.application.person.model.aPerson
import community.flock.eco.workday.domain.common.Status.APPROVED
import community.flock.eco.workday.domain.common.Status.DONE
import io.mockk.every
import io.mockk.mockk
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
                    status = DONE,
                    from = LocalDate.of(2023, 3, 7),
                    to = LocalDate.of(2023, 3, 10),
                ),
            )

        every { leaveDayRepository.findAllByStatusInAndType(listOf(APPROVED, DONE), HOLIDAY) }
            .returns(holidays)

        val result = calendarService.getCalendar()

        assertThat(result.events).hasSize(2)
    }
}
