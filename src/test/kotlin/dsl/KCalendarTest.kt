package dsl

import community.flock.eco.workday.dsl.KCalendar
import community.flock.eco.workday.dsl.KEvent
import community.flock.eco.workday.dsl.toCalendar
import community.flock.eco.workday.model.LeaveDay
import community.flock.eco.workday.model.LeaveDayType
import community.flock.eco.workday.model.Status.APPROVED
import model.aPerson
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate

class KCalendarTest {

    @Test
    fun `Empty calendar`() {
        val calendar = KCalendar(emptyList())

        assertThat(calendar.events).isEmpty()
    }

    @Test
    fun `Build calendar from holiDays`() {
        val holidays = listOf(
            LeaveDay(
                description = "description-1",
                hours = 8.0,
                person = aPerson(),
                type = LeaveDayType.HOLIDAY,
                status = APPROVED,
                from = LocalDate.of(2023, 3, 3),
                to = LocalDate.of(2023, 3, 4)
            ),
            LeaveDay(
                description = "description-2",
                hours = 8.0,
                person = aPerson(),
                type = LeaveDayType.HOLIDAY,
                status = APPROVED,
                from = LocalDate.of(2023, 3, 7),
                to = LocalDate.of(2023, 3, 10)
            )
        )

        val result = holidays.toCalendar()

        val resultEvents = result.events

        assertThat(resultEvents).hasSize(2)
        assertThat(resultEvents[0]).usingRecursiveComparison().ignoringFields("uid").isEqualTo(
            KEvent(
                uid = "any",
                summary = "Vakantie Henk Henkszoon (2 dagen)",
                startDate = LocalDate.of(2023, 3, 3),
                durationInDays = 2
            )
        )

        assertThat(resultEvents[1]).usingRecursiveComparison().ignoringFields("uid").isEqualTo(
            KEvent(
                uid = "any",
                summary = "Vakantie Henk Henkszoon (4 dagen)",
                startDate = LocalDate.of(2023, 3, 7),
                durationInDays = 4
            )
        )
    }

    @Test
    fun `Serializes to string`() {
        val holidays = listOf(
            LeaveDay(
                code = "f55ddf77-711d-47f0-a75f-677481c3452e",
                description = "description-1",
                hours = 8.0,
                person = aPerson(),
                type = LeaveDayType.HOLIDAY,
                status = APPROVED,
                from = LocalDate.of(2023, 3, 3),
                to = LocalDate.of(2023, 3, 4)
            ),
            LeaveDay(
                code = "13dc180a-391b-49e2-99db-73cd33523dd9",
                description = "description-2",
                hours = 8.0,
                person = aPerson(),
                type = LeaveDayType.HOLIDAY,
                status = APPROVED,
                from = LocalDate.of(2023, 3, 7),
                to = LocalDate.of(2023, 3, 10)
            )
        )

        val result = holidays.toCalendar().serialize()

        val expected = """
            BEGIN:VCALENDAR
            VERSION:2.0
            PRODID:-//Michael Angstadt//biweekly 0.6.7//EN
            NAME:Flock. Holidays
            BEGIN:VTIMEZONE
            TZID:Europe/Amsterdam
            END:VTIMEZONE
            BEGIN:VEVENT
            DTSTAMP:20230728T135556Z
            UID:f55ddf77-711d-47f0-a75f-677481c3452e
            SUMMARY:Vakantie Henk Henkszoon (2 dagen)
            DTSTART;TZID=Europe/Amsterdam:20230303T000000
            DURATION:P2D
            END:VEVENT
            BEGIN:VEVENT
            DTSTAMP:20230728T135556Z
            UID:13dc180a-391b-49e2-99db-73cd33523dd9
            SUMMARY:Vakantie Henk Henkszoon (4 dagen)
            DTSTART;TZID=Europe/Amsterdam:20230307T000000
            DURATION:P4D
            END:VEVENT
            END:VCALENDAR

        """.trimIndent()

        val resultLinesToCheck = result.lines().filterNot { it.startsWith("DTSTAMP") }
        val expectedLinesToCheck = expected.lines().filterNot { it.startsWith("DTSTAMP") }

        assertThat(resultLinesToCheck).isEqualTo(expectedLinesToCheck)
    }
}
