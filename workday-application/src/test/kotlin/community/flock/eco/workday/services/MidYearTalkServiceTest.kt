package community.flock.eco.workday.services

import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.repository.PersonLastDate
import community.flock.eco.workday.application.repository.PersonRepository
import community.flock.eco.workday.application.services.MidYearTalkService
import io.mockk.every
import io.mockk.impl.annotations.InjectMockKs
import io.mockk.impl.annotations.MockK
import io.mockk.junit5.MockKExtension
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNull

@ExtendWith(MockKExtension::class)
class MidYearTalkServiceTest {
    @MockK
    lateinit var personRepository: PersonRepository

    @MockK
    lateinit var eventDayRepository: EventDayRepository

    @InjectMockKs
    lateinit var service: MidYearTalkService

    private val before = LocalDate.of(2026, 12, 9)

    @Test
    fun `lists persons without a talk first, then those due by the given date`() {
        val never = person(1, "never")
        val overdue = person(2, "overdue")
        val dueSoon = person(3, "soon")
        val notYet = person(4, "notyet")
        val planned = person(5, "planned")

        every { personRepository.findAllByActive(Pageable.unpaged(), true) } returns
            PageImpl(listOf(notYet, dueSoon, planned, overdue, never))
        every { eventDayRepository.findLastDatePerPersonByEventType(EventType.MID_YEAR_TALK) } returns
            listOf(
                lastDate(2, LocalDate.of(2026, 3, 1)),
                lastDate(3, LocalDate.of(2026, 6, 1)),
                lastDate(4, LocalDate.of(2026, 7, 1)),
                lastDate(5, LocalDate.of(2026, 11, 15)),
            )

        val result = service.findAllDue(before)

        assertEquals(listOf("never", "overdue", "soon"), result.map { it.person.firstname })
        assertNull(result[0].lastTalk)
        assertNull(result[0].dueDate)
        assertEquals(LocalDate.of(2026, 9, 1), result[1].dueDate)
        assertEquals(LocalDate.of(2026, 12, 1), result[2].dueDate)
    }

    private fun person(
        id: Long,
        firstname: String,
    ) = Person(
        id = id,
        firstname = firstname,
        lastname = "doe",
        email = "$firstname@doe",
        position = "Software engineer",
        number = null,
        user = null,
    )

    private fun lastDate(
        personId: Long,
        date: LocalDate,
    ) = object : PersonLastDate {
        override val personId = personId
        override val lastDate = date
    }
}
