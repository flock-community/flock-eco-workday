package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Event
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
@Import(CreateHelper::class)
class EventRepositoryTest {

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Test
    fun `create update delete`() {

        val person1 = createHelper.createPerson()
        val person2 = createHelper.createPerson()

        val event = Event(
            description = "Nieuwjaarsdag",
            from = LocalDate.now(),
            to = LocalDate.now().plusDays(5),
            hours = 40,
            days = listOf(8, 8, 8, 8, 8),
            persons = listOf(person1, person2)
        )

        val created = eventRepository.save(event)
        assertNotNull(created.id)
        assertEquals(2, created.persons.size)

        assertEquals(1, eventRepository.findAll().count())

        eventRepository.delete(event)

        assertEquals(0, eventRepository.findAll().count())
    }
}
