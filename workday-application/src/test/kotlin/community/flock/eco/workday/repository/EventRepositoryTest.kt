package community.flock.eco.workday.repository

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventDay
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.repository.EventRepository
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class EventRepositoryTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var eventDayRepository: EventDayRepository

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Test
    fun `create update delete`() {
        val person1 = createHelper.createPersonEntity()
        val person2 = createHelper.createPersonEntity()

        val event =
            eventRepository.save(
                Event(
                    description = "Nieuwjaarsdag",
                    from = LocalDate.now(),
                    to = LocalDate.now().plusDays(5),
                    hours = 40.0,
                    costs = 538.38,
                    type = EventType.GENERAL_EVENT,
                ),
            )
        listOf(person1, person2).forEach { person ->
            eventDayRepository.save(
                EventDay(
                    from = event.from,
                    to = event.to,
                    hours = 40.0,
                    days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0),
                    person = person,
                    event = event,
                ),
            )
        }

        assertNotNull(event.id)
        assertEquals(2, eventDayRepository.findAllByEventCode(event.code).size)
        assertEquals(1, eventRepository.findAll().count())

        eventDayRepository.deleteAll(eventDayRepository.findAllByEventCode(event.code))
        eventRepository.delete(event)

        assertEquals(0, eventRepository.findAll().count())
    }
}
