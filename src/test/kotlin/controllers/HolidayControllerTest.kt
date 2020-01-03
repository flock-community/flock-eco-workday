package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.Application
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.model.HolidayStatus
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.utils.dayFromLocalDate
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.http.MediaType.APPLICATION_JSON_UTF8
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.request.RequestPostProcessor
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureMockMvc
@ActiveProfiles(profiles = ["test"])
class HolidayControllerTest {
    private val baseUrl: String = "/api/holidays"
    private val email: String = "admin@reynholm-industries.co.uk"

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Autowired
    private lateinit var userAccountService: UserAccountService

    @Autowired
    private lateinit var personService: PersonService

    @Autowired
    private lateinit var userService: UserService

    private lateinit var user: RequestPostProcessor

    @Before
    fun setup() {
        user = UserAccountPasswordForm(
            email = email,
            name = "Administrator",
            authorities = setOf(
                "HolidayAuthority.ADMIN",
                "HolidayAuthority.READ",
                "HolidayAuthority.WRITE"
            ),
            password = "admin")
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }
    }

    @After
    fun teardown() {
        userAccountService.findUserAccountPasswordByUserEmail(email)
            ?.apply { userService.delete(this.user.code) }
    }

    @Test
    fun `should get a holiday via GET-method`() {
        /* DRY-Block */
        val person = PersonForm(
            firstname = "Jen",
            lastname = "Barber",
            email = "jen@reynholm-industries.co.uk",
            position = "Head of IT",
            userCode = null
        ).run { personService.create(this)!! }

        val holidayForm = HolidayForm(
            description = "Wimbledon",
            status = HolidayStatus.REQUESTED,
            from = dayFromLocalDate(),
            to = dayFromLocalDate(1),
            days = listOf(8),
            hours = 8,
            personCode = person.code
        )

        val holidayCode = post(holidayForm)
            .andReturn()
            .response
            .contentAsString
            .run { mapper.readTree(this) }
            .run { this.get("code").textValue() }
        /* DRY-Block */

        get(holidayForm, holidayCode)
    }

    @Test
    fun `should create a valid holiday via POST-method`() {
        /* DRY-Block */
        val person = PersonForm(
            firstname = "Jen",
            lastname = "Barber",
            email = "jen@reynholm-industries.co.uk",
            position = "Head of IT",
            userCode = null
        ).run { personService.create(this)!! }
        /* DRY-Block */

        val holidayForm = HolidayForm(
            description = "Wimbledon",
            status = HolidayStatus.REQUESTED,
            from = dayFromLocalDate(),
            to = dayFromLocalDate(1),
            days = listOf(8),
            hours = 8,
            personCode = person.code
        )

        post(holidayForm)
    }

    @Test
    fun `should update a existing holiday via PUT-Method`() {
        /* DRY-Block */
        val person = PersonForm(
            firstname = "Jen",
            lastname = "Barber",
            email = "jen@reynholm-industries.co.uk",
            position = "Head of IT",
            userCode = null
        ).run { personService.create(this)!! }

        val holidayForm = HolidayForm(
            description = "Wimbledon",
            status = HolidayStatus.REQUESTED,
            from = dayFromLocalDate(),
            to = dayFromLocalDate(1),
            days = listOf(8),
            hours = 8,
            personCode = person.code
        )

        val holidayCode = post(holidayForm)
            .andReturn()
            .response
            .contentAsString
            .run { mapper.readTree(this) }
            .run { this.get("code").textValue() }
        /* DRY-Block */
        holidayForm.copy(status = HolidayStatus.APPROVED)

        put(holidayForm, holidayCode)
    }

    @Test
    fun `should delete a holiday via DELETE-Method`() {
        /* DRY-Block */
        val person = PersonForm(
            firstname = "Jen",
            lastname = "Barber",
            email = "jen@reynholm-industries.co.uk",
            position = "Head of IT",
            userCode = null
        ).run { personService.create(this)!! }

        val holidayForm = HolidayForm(
            description = "Wimbledon",
            status = HolidayStatus.REQUESTED,
            from = dayFromLocalDate(),
            to = dayFromLocalDate(1),
            days = listOf(8),
            hours = 8,
            personCode = person.code
        )

        val holidayCode = post(holidayForm)
            .andReturn()
            .response
            .contentAsString
            .run { mapper.readTree(this) }
            .run { this.get("code").textValue() }
        /* DRY-Block */

        mvc.perform(delete("$baseUrl/$holidayCode")
            .with(user)
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isNoContent)

        mvc.perform(get("$baseUrl/$holidayCode")
            .with(user)
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isNotFound)
    }

    // *-- utility functions --*
//    private fun getAll() = get()
    /**
     *
     */
    private fun get(holidayForm: HolidayForm, holidayCode: String? = null) = mvc.perform(
        get("$baseUrl/$holidayCode")
            .with(user)
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
        .andExpect(status().isOk)
        .andExpect(content().contentType(APPLICATION_JSON_UTF8))
        .andExpect(content().json(mapper.writeValueAsString(holidayForm)))

    /**
     *
     */
    private fun post(holidayForm: HolidayForm) = mvc.perform(
        post(baseUrl)
            .with(user)
            .content(mapper.writeValueAsString(holidayForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
        .andExpect(status().isOk)
        .andExpect(content().contentType(APPLICATION_JSON_UTF8))
        .andExpect(content().json(mapper.writeValueAsString(holidayForm)))

    /**
     *
     */
    private fun put(holidayForm: HolidayForm, holidayCode: String) = mvc.perform(
        put("$baseUrl/$holidayCode")
            .with(user)
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
        .andExpect(status().isOk)
        .andExpect(content().contentType(APPLICATION_JSON_UTF8))
        .andExpect(content().json(mapper.writeValueAsString(holidayForm)))
}
