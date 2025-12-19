package community.flock.eco.workday.repository

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.repository.EventRepository
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull

class EventRepositoryTest() : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Test
    fun `create update delete`() {
        val person1 = createHelper.createPerson()
        val person2 = createHelper.createPerson()

        val event =
            Event(
                description = "Nieuwjaarsdag",
                from = LocalDate.now(),
                to = LocalDate.now().plusDays(5),
                hours = 40.0,
                days = mutableListOf(8.0, 8.0, 8.0, 8.0, 8.0),
                persons = mutableListOf(person1, person2),
                costs = 538.38,
                type = EventType.GENERAL_EVENT,
            )

        val created = eventRepository.save(event)
        assertNotNull(created.id)
        assertEquals(2, created.persons.size)

        assertEquals(1, eventRepository.findAll().count())

        eventRepository.delete(event)

        assertEquals(0, eventRepository.findAll().count())
    }
}
