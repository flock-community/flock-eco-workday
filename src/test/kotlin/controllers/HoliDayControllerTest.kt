package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.Application
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.services.HoliDayService
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNull

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class HoliDayControllerTest {
    private val baseUrl: String = "/api/holidays"

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var holiDayService: HoliDayService

    val adminAuthorities = setOf(HolidayAuthority.READ, HolidayAuthority.WRITE, HolidayAuthority.ADMIN)
    val userAuthorities = setOf(HolidayAuthority.READ, HolidayAuthority.WRITE)

    @Test
    fun `should get a holiday via GET-method`() {

        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6, 6, 6)
        val hours = 18
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm = HoliDayForm(
            from = from,
            to = to,
            days = days,
            hours = hours,
            personCode = person.code,
            description = description,
            status = status
        )

        val created = holiDayService.create(createForm)

        mvc.perform(get("$baseUrl/${created.code}")
            .with(user(CreateHelper.UserSecurity(user)))
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.description").value(description))
            .andExpect(jsonPath("\$.status").value(status.toString()))
            .andExpect(jsonPath("\$.hours").value(hours))
            .andExpect(jsonPath("\$.personCode").value(person.code))
    }

    @Test
    fun `should create a valid holiday via POST-method with status REQUESTED`() {

        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6, 6, 6)
        val hours = 18
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm = HoliDayForm(
            from = from,
            to = to,
            days = days,
            hours = hours,
            personCode = person.code,
            description = description,
            status = status
        )

        mvc.perform(post("$baseUrl")
            .with(user(CreateHelper.UserSecurity(user)))
            .content(mapper.writeValueAsString(createForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.description").value(description))
            .andExpect(jsonPath("\$.status").value(status.toString()))
            .andExpect(jsonPath("\$.hours").value(hours))
            .andExpect(jsonPath("\$.personCode").value(person.code))

    }

    @Test
    fun `should update a existing holiday via PUT-Method`() {

        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6, 6, 6)
        val hours = 18
        val description = "Lucy in the sky with diamonds"
        val updatedDescription = "All the leaves are brown"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm = HoliDayForm(
            from = from,
            to = to,
            days = days,
            hours = hours,
            personCode = person.code,
            description = description,
            status = status
        )

        val created = holiDayService.create(createForm)

        val updatedCreateForm = createForm.copy(description = updatedDescription)

        mvc.perform(put("$baseUrl/${created.code}")
            .with(user(CreateHelper.UserSecurity(user)))
            .content(mapper.writeValueAsString(updatedCreateForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.description").value(updatedDescription))
            .andExpect(jsonPath("\$.status").value(status.toString()))
            .andExpect(jsonPath("\$.hours").value(hours))
            .andExpect(jsonPath("\$.personCode").value(person.code))

    }

    @Test
    fun `should not be allowed to update status field existing holiday via PUT-Method`() {

        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6, 6, 6)
        val hours = 18
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val updatedStatus = Status.APPROVED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm = HoliDayForm(
            from = from,
            to = to,
            days = days,
            hours = hours,
            personCode = person.code,
            description = description,
            status = status
        )

        val created = holiDayService.create(createForm)

        val updatedCreateForm = createForm.copy(status = updatedStatus)

        mvc.perform(put("$baseUrl/${created.code}")
            .with(user(CreateHelper.UserSecurity(user)))
            .content(mapper.writeValueAsString(updatedCreateForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isForbidden)

        assertEquals(holiDayService.findByCode(created.code)?.status, status)
    }


    @Test
    fun `admin can update status field existing holiday via PUT-Method`() {

        val admin = createHelper.createUser(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6, 6, 6)
        val hours = 18
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val updatedStatus = Status.APPROVED
        val person = createHelper.createPerson("john", "doe", admin.code)

        val createForm = HoliDayForm(
            from = from,
            to = to,
            days = days,
            hours = hours,
            personCode = person.code,
            description = description,
            status = status
        )

        val created = holiDayService.create(createForm)

        val updatedCreateForm = createForm.copy(status = updatedStatus)

        mvc.perform(put("$baseUrl/${created.code}")
            .with(user(CreateHelper.UserSecurity(admin)))
            .content(mapper.writeValueAsString(updatedCreateForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.status").value(updatedStatus.toString()))
    }


    @Test
    fun `should delete a holiday via DELETE-Method`() {
        val admin = createHelper.createUser(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6, 6, 6)
        val hours = 18
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val updatedStatus = Status.APPROVED
        val person = createHelper.createPerson("john", "doe", admin.code)

        val createForm = HoliDayForm(
            from = from,
            to = to,
            days = days,
            hours = hours,
            personCode = person.code,
            description = description,
            status = status
        )

        val created = holiDayService.create(createForm)

        mvc.perform(delete("$baseUrl/${created.code}")
            .with(user(CreateHelper.UserSecurity(admin)))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isNoContent)

        assertNull(holiDayService.findByCode(created.code))
    }
}
