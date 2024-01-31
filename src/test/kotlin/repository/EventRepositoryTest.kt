package community.flock.eco.workday.repository

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.EventType
import config.AppTestConfig
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
import kotlin.test.assertNotNull

@SpringBootTest(classes = [ApplicationConfiguration::class, AppTestConfig::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@Transactional
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class EventRepositoryTest(
    @Autowired private val eventRepository: EventRepository,
    @Autowired private val createHelper: CreateHelper
) {

    @Test
    fun `create update delete`() {

        val person1 = createHelper.createPerson()
        val person2 = createHelper.createPerson()

        val event = Event(
            description = "Nieuwjaarsdag",
            from = LocalDate.now(),
            to = LocalDate.now().plusDays(5),
            hours = 40.0,
            days = listOf(8.0, 8.0, 8.0, 8.0, 8.0),
            persons = listOf(person1, person2),
            costs = 538.38,
            type = EventType.GENERAL_EVENT
        )

        val created = eventRepository.save(event)
        assertNotNull(created.id)
        assertEquals(2, created.persons.size)

        assertEquals(1, eventRepository.findAll().count())

        eventRepository.delete(event)

        assertEquals(0, eventRepository.findAll().count())
    }
}
