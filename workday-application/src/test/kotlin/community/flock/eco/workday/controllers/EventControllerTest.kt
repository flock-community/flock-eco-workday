package community.flock.eco.workday.controllers

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.repository.EventRepository
import community.flock.eco.workday.application.services.EventRatingService
import community.flock.eco.workday.application.services.EventService
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.domain.budget.AllocationType
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.TimeAllocation
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserSecurityService
import community.flock.eco.workday.user.services.UserService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class EventControllerTest : WorkdayIntegrationTest() {
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

    @Autowired
    private lateinit var budgetAllocationService: BudgetAllocationService

    fun createUser(authorities: Set<String>) =
        UserAccountPasswordForm(
            email = UUID.randomUUID().toString(),
            name = "Administrator",
            authorities = authorities,
            password = "admin",
        ).run { userAccountService.createUserAccountPassword(this) }
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
        budget = 200.0,
        personIds = ids,
        type = type,
    ).run { eventService.create(this) }

    @Test
    fun `should get all events of a year regardless of type`() {
        val hackDay = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3), type = EventType.FLOCK_HACK_DAY)
        createEvent(LocalDate.of(2024, 4, 2), LocalDate.of(2024, 4, 3), type = EventType.FLOCK_HACK_DAY)
        val communityDay =
            createEvent(LocalDate.of(2023, 6, 2), LocalDate.of(2023, 6, 3), type = EventType.FLOCK_COMMUNITY_DAY)
        val generalEvent =
            createEvent(LocalDate.of(2023, 12, 30), LocalDate.of(2023, 12, 31), type = EventType.GENERAL_EVENT)

        mvc
            .perform(
                get("$baseUrl/year?year=2023")
                    .with(SecurityMockMvcRequestPostProcessors.user(createUser(adminAuthorities)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(
                content().json(
                    // language=json
                    """
                    [
                      {
                        "type": "FLOCK_HACK_DAY",
                        "code": "${hackDay.code}",
                        "from": "2023-02-02",
                        "to": "2023-02-03"
                      },
                      {
                        "type": "FLOCK_COMMUNITY_DAY",
                        "code": "${communityDay.code}",
                        "from": "2023-06-02",
                        "to": "2023-06-03"
                      },
                      {
                        "type": "GENERAL_EVENT",
                        "code": "${generalEvent.code}",
                        "from": "2023-12-30",
                        "to": "2023-12-31"
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

        mvc
            .perform(
                put("$baseUrl/${event.code}/subscribe")
                    .with(SecurityMockMvcRequestPostProcessors.user(user))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
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

        mvc
            .perform(
                put("$baseUrl/${event.code}/unsubscribe")
                    .with(SecurityMockMvcRequestPostProcessors.user(user))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.persons.length()").value(1))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.persons[0].uuid").value(person02.uuid.toString()))
    }

    @Test
    fun `switching an event's time allocation type retypes the same allocation`() {
        val user = createUser(adminAuthorities)
        val person = createPerson(user.account.user.code)
        val form =
            EventForm(
                description = "Type switch",
                from = LocalDate.of(2024, 2, 5),
                to = LocalDate.of(2024, 2, 6),
                hours = 16.0,
                days = mutableListOf(8.0, 8.0),
                budget = 0.0,
                personIds = listOf(person.uuid),
                type = EventType.FLOCK_HACK_DAY,
                defaultTimeAllocationType = "HACK",
            )
        val event = eventService.create(form)

        val afterCreate = budgetAllocationService.findAllByEventCode(event.code).filterIsInstance<TimeAllocation>()
        assertEquals(1, afterCreate.size, "one time allocation expected on create")
        assertTrue(
            afterCreate.single().dailyAllocations.all { it.type == AllocationType.HACK },
            "daily rows should be typed HACK on create",
        )
        val originalCode = afterCreate.single().code

        eventService.update(event.code, form.copy(defaultTimeAllocationType = "TRAINING"))

        val afterSwitch = budgetAllocationService.findAllByEventCode(event.code).filterIsInstance<TimeAllocation>()
        assertEquals(1, afterSwitch.size, "switch should reuse the same allocation, not create a second one")
        assertEquals(originalCode, afterSwitch.single().code, "the same allocation should be retyped")
        assertTrue(
            afterSwitch.single().dailyAllocations.all { it.type == AllocationType.TRAINING },
            "daily rows should be retyped TRAINING after switch",
        )
    }

    @Test
    fun `event money budget is split across participants without dropping the rounding remainder`() {
        val person1 = createStandalonePerson("split1@flock", "Split1")
        val person2 = createStandalonePerson("split2@flock", "Split2")
        val person3 = createStandalonePerson("split3@flock", "Split3")
        val form =
            EventForm(
                description = "Budget split",
                from = LocalDate.of(2024, 3, 4),
                to = LocalDate.of(2024, 3, 4),
                hours = 8.0,
                days = mutableListOf(8.0),
                budget = 100.0,
                personIds = listOf(person1.uuid, person2.uuid, person3.uuid),
                type = EventType.GENERAL_EVENT,
            )
        val event = eventService.create(form)

        val amounts =
            budgetAllocationService
                .findAllByEventCode(event.code)
                .filterIsInstance<MoneyAllocation>()
                .map { it.amount }

        assertEquals(3, amounts.size)
        assertEquals(
            BigDecimal("100.00"),
            amounts.fold(BigDecimal.ZERO) { acc, amount -> acc + amount },
            "shares must add up to the full budget",
        )
        assertEquals(1, amounts.count { it.compareTo(BigDecimal("33.34")) == 0 }, "one participant absorbs the extra cent")
        assertEquals(2, amounts.count { it.compareTo(BigDecimal("33.33")) == 0 })
    }

    private fun createStandalonePerson(
        email: String,
        firstname: String,
    ) = PersonForm(
        email = email,
        firstname = firstname,
        lastname = "Flock",
        position = "Software engineer",
        userCode = null,
        number = null,
        active = true,
    ).run { personService.create(this) } ?: error("Cannot create person")

    @Test
    fun `Worker with only SUBSCRIBE authority can list events, redacted when not attending`() {
        createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))
        val user = createUser(setOf("EventAuthority.SUBSCRIBE"))

        mvc
            .perform(
                get(baseUrl)
                    .with(SecurityMockMvcRequestPostProcessors.user(user))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].description").value("N/A - Henk"))
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].persons.length()").value(0))
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].budget").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].days").doesNotExist())
    }

    @Test
    fun `User needs the right EventAuthority`() {
        val event = createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3))
        val user = createUser(setOf("EventAuthority.READ", "EventAuthority.WRITE", "EventAuthority.ADMIN"))
        createPerson(user.account.user.code)

        mvc
            .perform(
                put("$baseUrl/${event.code}/unsubscribe")
                    .with(SecurityMockMvcRequestPostProcessors.user(user))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
