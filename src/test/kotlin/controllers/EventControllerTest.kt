package controllers

import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.Application
import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.EventType
import community.flock.eco.workday.repository.EventRepository
import community.flock.eco.workday.services.EventRatingService
import community.flock.eco.workday.services.EventService
import community.flock.eco.workday.services.PersonService
import config.AppTestConfig
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import java.util.UUID

@SpringBootTest(classes = [Application::class, AppTestConfig::class], webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@AutoConfigureMockMvc
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class EventControllerTest() {
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
    ) = EventForm(
        description = "Henk",
        from = from,
        to = to,
        hours = 16.0,
        days = listOf(8.0, 8.0),
        costs = 200.0,
        personIds = ids,
        type = EventType.GENERAL_EVENT,
    )
        .run { eventService.create(this) }

    @AfterEach
    fun afterEach() {
        eventRepository.deleteAll()
    }

    @Test
    fun `should get upcoming events`() {
        val event = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))
        createEvent(LocalDate.of(2023, 4, 2), LocalDate.of(2023, 4, 3))
        createEvent(LocalDate.of(2023, 6, 2), LocalDate.of(2023, 6, 3))

        mvc.perform(
            get("$baseUrl/upcoming?fromDate=2023-01-01&toDate=2023-03-01")
                .with(SecurityMockMvcRequestPostProcessors.user(createUser(adminAuthorities)))
                .accept(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(
                content().json(
                    """
                    [{"description":"Henk","id":${event.id},"code":"${event.code}","from":"2023-02-02","to":"2023-02-03",
                      "hours":16.0,"costs":200.0,"days":[8.0,8.0],"persons":[]}]
                    """.trimIndent(),
                ),
            )
    }

    @Test
    fun `as Admin costs should be visible when getting upcoming events`() {
        val event = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))

        mvc.perform(
            get("$baseUrl/upcoming?fromDate=2023-01-01&toDate=2023-12-31")
                .with(SecurityMockMvcRequestPostProcessors.user(createUser(adminAuthorities)))
                .accept(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].costs").value(event.costs))
    }

    @Test
    fun `as costs should not be visible when getting upcoming events`() {
        createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))

        mvc.perform(
            get("$baseUrl/upcoming?fromDate=2023-01-01&toDate=2023-12-31")
                .with(SecurityMockMvcRequestPostProcessors.user(createUser(userAuthorities)))
                .accept(MediaType.APPLICATION_JSON),
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].costs").value(0.0))
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
