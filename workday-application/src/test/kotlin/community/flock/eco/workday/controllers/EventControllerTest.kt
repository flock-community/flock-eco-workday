package community.flock.eco.workday.controllers

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.EventDayInput
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.repository.EventDayRepository
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
import kotlin.test.assertNull

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
    private lateinit var eventDayRepository: EventDayRepository

    @Autowired
    private lateinit var personService: PersonService

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
        costs = 200.0,
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
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{}")
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.persons[0].uuid").value(person.uuid.toString()))

        val eventDay = eventDayRepository.findAllByEventCode(event.code).single()
        assertEquals(event.hours, eventDay.hours)
    }

    @Test
    fun `Person can subscribe with a hack-hours override`() {
        val event =
            createEvent(LocalDate.of(2023, 2, 2), LocalDate.of(2023, 2, 3), type = EventType.FLOCK_HACK_DAY)
        val user = createUser(userAuthorities)
        createPerson(user.account.user.code)

        mvc
            .perform(
                put("$baseUrl/${event.code}/subscribe")
                    .with(SecurityMockMvcRequestPostProcessors.user(user))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"hours": 4}""")
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)

        val eventDay = eventDayRepository.findAllByEventCode(event.code).single()
        assertEquals(4.0, eventDay.hours)

        mvc
            .perform(
                put("$baseUrl/${event.code}/subscribe")
                    .with(SecurityMockMvcRequestPostProcessors.user(user))
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""{"hours": 6}""")
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)

        val updated = eventDayRepository.findAllByEventCode(event.code).single()
        assertEquals(6.0, updated.hours)
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
            .andExpect(MockMvcResultMatchers.jsonPath("\$[0].costs").value(0.0))
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

    @Test
    fun `editing an event re-syncs each participant's EventDay`() {
        val person = createPerson(createUser(userAuthorities).account.user.code)
        val day = LocalDate.of(2023, 3, 1)
        val created =
            EventForm(
                description = "Hack",
                from = day,
                to = day,
                hours = 8.0,
                days = mutableListOf(8.0),
                costs = 0.0,
                personIds = listOf(person.uuid),
                type = EventType.FLOCK_HACK_DAY,
            ).run { eventService.create(this) }
        assertEquals(8.0, eventDayRepository.findAllByEventCode(created.code).single().hours)

        EventForm(
            description = "Hack",
            from = day,
            to = day,
            hours = 4.0,
            days = mutableListOf(4.0),
            costs = 0.0,
            personIds = listOf(person.uuid),
            type = EventType.FLOCK_HACK_DAY,
        ).run { eventService.update(created.code, this) }
        assertEquals(4.0, eventDayRepository.findAllByEventCode(created.code).single().hours)
    }

    @Test
    fun `editing an event keeps a participant's hour override`() {
        val person = createPerson(createUser(userAuthorities).account.user.code)
        val day = LocalDate.of(2023, 3, 1)
        val created =
            EventForm(
                description = "Hack",
                from = day,
                to = day,
                hours = 8.0,
                days = mutableListOf(8.0),
                costs = 0.0,
                personIds = listOf(person.uuid),
                type = EventType.FLOCK_HACK_DAY,
            ).run { eventService.create(this) }

        eventService.subscribeToEvent(created.code, person, 4.0)
        assertEquals(4.0, eventDayRepository.findAllByEventCode(created.code).single().hours)

        EventForm(
            description = "Hack renamed",
            from = day,
            to = day,
            hours = 8.0,
            days = mutableListOf(8.0),
            costs = 0.0,
            personIds = listOf(person.uuid),
            type = EventType.FLOCK_HACK_DAY,
        ).run { eventService.update(created.code, this) }

        assertEquals(4.0, eventDayRepository.findAllByEventCode(created.code).single().hours)
    }

    @Test
    fun `editing an event removes a participant dropped from the form`() {
        val keep = createPerson(createUser(userAuthorities).account.user.code)
        val drop = createPerson(createUser(userAuthorities).account.user.code)
        val day = LocalDate.of(2023, 3, 1)
        val created =
            EventForm(
                description = "Conf",
                from = day,
                to = day,
                hours = 8.0,
                days = mutableListOf(8.0),
                costs = 0.0,
                personIds = listOf(keep.uuid, drop.uuid),
                type = EventType.GENERAL_EVENT,
            ).run { eventService.create(this) }
        assertEquals(2, eventDayRepository.findAllByEventCode(created.code).size)

        EventForm(
            description = "Conf",
            from = day,
            to = day,
            hours = 8.0,
            days = mutableListOf(8.0),
            costs = 0.0,
            personIds = listOf(keep.uuid),
            type = EventType.GENERAL_EVENT,
        ).run { eventService.update(created.code, this) }

        val remaining = eventDayRepository.findAllByEventCode(created.code)
        assertEquals(1, remaining.size)
        assertEquals(keep.uuid, remaining.single().person.uuid)
    }

    @Test
    fun `event cost stays split to the total across subscribe and unsubscribe`() {
        val day = LocalDate.of(2023, 3, 1)
        val p1 = createPerson(createUser(userAuthorities).account.user.code)
        val p2 = createPerson(createUser(userAuthorities).account.user.code)
        val created =
            EventForm(
                description = "Conf",
                from = day,
                to = day,
                hours = 8.0,
                days = mutableListOf(8.0),
                costs = 1000.0,
                personIds = listOf(p1.uuid, p2.uuid),
                type = EventType.CONFERENCE,
            ).run { eventService.create(this) }
        assertEquals(BigDecimal("1000.00"), costSumOf(created.code))

        val p3 = createPerson(createUser(userAuthorities).account.user.code)
        eventService.subscribeToEvent(created.code, p3)
        assertEquals(3, eventDayRepository.findAllByEventCode(created.code).size)
        assertEquals(BigDecimal("1000.00"), costSumOf(created.code))

        eventService.unsubscribeFromEvent(created.code, p3)
        assertEquals(BigDecimal("1000.00"), costSumOf(created.code))
    }

    @Test
    fun `explicit participants persist per-person hours and cost faithfully`() {
        val day = LocalDate.of(2023, 3, 1)
        val p1 = createPerson(createUser(userAuthorities).account.user.code)
        val p2 = createPerson(createUser(userAuthorities).account.user.code)
        val created =
            EventForm(
                description = "Conf",
                from = day,
                to = day,
                hours = 8.0,
                days = mutableListOf(8.0),
                costs = 1000.0,
                personIds = listOf(p1.uuid, p2.uuid),
                participants =
                    listOf(
                        EventDayInput(p1.uuid, hours = 4.0, cost = BigDecimal("600.00")),
                        EventDayInput(p2.uuid, hours = 12.0, cost = BigDecimal("400.00")),
                    ),
                type = EventType.CONFERENCE,
            ).run { eventService.create(this) }

        val byPerson = eventDayRepository.findAllByEventCode(created.code).associateBy { it.person.uuid }
        assertEquals(2, byPerson.size)
        assertEquals(4.0, byPerson.getValue(p1.uuid).hours)
        assertEquals(12.0, byPerson.getValue(p2.uuid).hours)
        assertEquals(BigDecimal("600.00"), byPerson.getValue(p1.uuid).cost)
        assertEquals(BigDecimal("400.00"), byPerson.getValue(p2.uuid).cost)
        assertEquals(BigDecimal("1000.00"), costSumOf(created.code))
    }

    @Test
    fun `hack event participants carry no cost`() {
        val day = LocalDate.of(2023, 3, 1)
        val person = createPerson(createUser(userAuthorities).account.user.code)
        val created =
            EventForm(
                description = "Hack",
                from = day,
                to = day,
                hours = 8.0,
                days = mutableListOf(8.0),
                costs = 0.0,
                personIds = listOf(person.uuid),
                participants = listOf(EventDayInput(person.uuid, hours = 8.0, cost = null)),
                type = EventType.FLOCK_HACK_DAY,
            ).run { eventService.create(this) }

        assertNull(eventDayRepository.findAllByEventCode(created.code).single().cost)
    }

    @Test
    fun `event response exposes per-person eventDays`() {
        val day = LocalDate.of(2023, 3, 1)
        val person = createPerson(createUser(userAuthorities).account.user.code)
        val created =
            EventForm(
                description = "Conf",
                from = day,
                to = day,
                hours = 8.0,
                days = mutableListOf(8.0),
                costs = 1000.0,
                personIds = listOf(person.uuid),
                participants = listOf(EventDayInput(person.uuid, hours = 5.0, cost = BigDecimal("1000.00"))),
                type = EventType.CONFERENCE,
            ).run { eventService.create(this) }

        mvc
            .perform(
                get("$baseUrl/${created.code}")
                    .with(SecurityMockMvcRequestPostProcessors.user(createUser(adminAuthorities)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("\$.eventDays.length()").value(1))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.eventDays[0].personId").value(person.uuid.toString()))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.eventDays[0].hours").value(5.0))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.eventDays[0].cost").value(1000.0))
    }

    private fun costSumOf(code: String): BigDecimal =
        eventDayRepository
            .findAllByEventCode(code)
            .fold(BigDecimal.ZERO) { acc, day -> acc + (day.cost ?: BigDecimal.ZERO) }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
