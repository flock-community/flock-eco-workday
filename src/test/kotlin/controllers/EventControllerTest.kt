package controllers

import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.Application
import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.services.EventRatingService
import community.flock.eco.workday.services.EventService
import org.junit.jupiter.api.Test

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.repository.EventRepository
import config.AppTestConfig
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.TestInstance
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import java.util.*

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
    private val adminAuthorities = setOf("EventAuthority.READ", "EventAuthority.WRITE", "EventAuthority.ADMIN")
    private val userAuthorities = setOf("EventAuthority.READ", "EventAuthority.WRITE")

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

    fun createUser(authorities: Set<String>) = UserAccountPasswordForm(
        email = UUID.randomUUID().toString(),
        name = "Administrator",
        authorities = authorities,
        password = "admin"
    )
        .run { userAccountService.createUserAccountPassword(this) }
        .run { UserSecurityService.UserSecurityPassword(this) }
        .run { SecurityMockMvcRequestPostProcessors.user(this) }

    fun createEvent(from: LocalDate, to: LocalDate) = EventForm(
        description = "Henk",
        from = from,
        to = to,
        hours = 16.0,
        days = listOf(8.0, 8.0),
        costs = 200.0,
        personIds = listOf()
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
                .with(createUser(adminAuthorities))
                .accept(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(content().json("""
                [{"description":"Henk","id":${event.id},"code":"${event.code}","from":"2023-02-02","to":"2023-02-03",
                  "hours":16.0,"costs":200.0,"days":[8.0,8.0],"persons":[]}]
            """.trimIndent()))
    }

    @Test
    fun `as Admin costs should be visible when getting upcoming events`() {
        val event = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))

        mvc.perform(
            get("$baseUrl/upcoming?fromDate=2023-01-01&toDate=2023-12-31")
                .with(createUser(adminAuthorities))
                .accept(MediaType.APPLICATION_JSON)
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
                .with(createUser(userAuthorities))
                .accept(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].costs").value(0.0))
    }
}
