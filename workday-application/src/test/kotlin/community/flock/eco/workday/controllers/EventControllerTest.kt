package community.flock.eco.workday.controllers

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.repository.EventRepository
import community.flock.eco.workday.application.services.EventRatingService
import community.flock.eco.workday.application.services.EventService
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserSecurityService
import community.flock.eco.workday.user.services.UserService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import java.util.UUID

class EventControllerTest() : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/events"
    private val adminAuthorities =
        setOf("EventAuthority.READ", "EventAuthority.WRITE", "EventAuthority.SUBSCRIBE", "EventAuthority.ADMIN")
    private val userAuthorities = setOf("EventAuthority.READ", "EventAuthority.WRITE", "EventAuthority.SUBSCRIBE")

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var eventService: EventService

    @Autowired
    private lateinit var eventRatingService: EventRatingService

    @Autowired
    private lateinit var userService: UserService

    @Autowired
    private lateinit var userAccountService: UserAccountService

    @Autowired
    private lateinit var eventRepository: EventRepository

    @Autowired
    private lateinit var personService: PersonService

    fun createUser(authorities: Set<String>) =
        UserAccountPasswordForm(
            email = UUID.randomUUID().toString(),
            name = "Administrator",
            authorities = authorities,
            password = "admin",
        )
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }

    fun createPerson(userCode: String) =
        PersonForm(
            email = "piet@flock",
            firstname = "Piet",
            lastname = "Flock",
            position = "Software engineer",
            userCode = userCode,
            number = null,
            active = true,
        ).run {
            personService.create(this)
        } ?: error("Cannot create person")

    fun createEvent(
        from: LocalDate,
        to: LocalDate,
        ids: List<UUID> = listOf(),
        type: EventType = EventType.GENERAL_EVENT,
    ) = EventForm(
        description = "Henk",
        from = from,
        to = to,
        hours = 16.0,
        days = mutableListOf(8.0, 8.0),
        costs = 200.0,
        personIds = ids,
        type = type,
    )
        .run { eventService.create(this) }

    @Test
    fun `should get hack-day events`() {
        val event = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3), type = EventType.FLOCK_HACK_DAY)
        createEvent(LocalDate.of(2024, 4, 2), LocalDate.of(2024, 4, 3), type = EventType.FLOCK_HACK_DAY)
        createEvent(LocalDate.of(2023, 6, 2), LocalDate.of(2023, 6, 3), type = EventType.FLOCK_COMMUNITY_DAY)

        mvc.perform(
            get("$baseUrl/hack-days?year=2023")
                .with(SecurityMockMvcRequestPostProcessors.user(createUser(adminAuthorities)))
                .accept(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(
                content().json(
                    // language=json
                    """
                    [
                      {
                        "description": "Henk",
                        "code": "${event.code}",
                        "from": "2023-02-02",
                        "to": "2023-02-03",
                        "persons": []
                      }
                    ]
                    """.trimIndent(),
                ),
            )
    }

    @Test
    fun `Person is able to subscribe to an Event`() {
        val event = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))
        val user = createUser(userAuthorities)
        val person = createPerson(user.account.user.code)

        mvc.perform(
            put("$baseUrl/${event.code}/subscribe")
                .with(SecurityMockMvcRequestPostProcessors.user(user))
                .accept(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.persons[0].uuid").value(person.uuid.toString()))
    }

    @Test
    fun `Person is able to unsubscribe from an Event`() {
        val user = createUser(userAuthorities)
        val person01 = createPerson(user.account.user.code)
        val person02 = createPerson("")
        val event =
            createEvent(
                LocalDate.of(2023, 2, 2),
                LocalDate.of(2023, 2, 3),
                listOf(person01.uuid, person02.uuid),
            )

        mvc.perform(
            put("$baseUrl/${event.code}/unsubscribe")
                .with(SecurityMockMvcRequestPostProcessors.user(user))
                .accept(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.persons.length()").value(1))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.persons[0].uuid").value(person02.uuid.toString()))
    }

    @Test
    fun `User needs the right EventAuthority`() {
        val event = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))
        val user = createUser(setOf("EventAuthority.READ", "EventAuthority.WRITE", "EventAuthority.ADMIN"))
        createPerson(user.account.user.code)

        mvc.perform(
            put("$baseUrl/${event.code}/unsubscribe")
                .with(SecurityMockMvcRequestPostProcessors.user(user))
                .accept(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isForbidden)
    }
}
