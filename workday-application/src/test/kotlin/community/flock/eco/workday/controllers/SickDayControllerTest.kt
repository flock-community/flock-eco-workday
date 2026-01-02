package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.SickdayAuthority
import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
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

class SickDayControllerTest : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/sickdays"

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var sickDayService: SickDayService

    val adminAuthorities = setOf(SickdayAuthority.READ, SickdayAuthority.WRITE, SickdayAuthority.ADMIN)
    val userAuthorities = setOf(SickdayAuthority.READ, SickdayAuthority.WRITE)

    @Test
    fun `should get all sickdays from all users`() {
        val admin = createHelper.createUser(adminAuthorities)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(admin)))
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
    }

    @Test
    fun `should get all sickdays from a single user`() {
        val user = createHelper.createUser(userAuthorities)
        val person = createHelper.createPerson("john", "doe", user.code)
        val admin = createHelper.createUser(adminAuthorities)

        mvc
            .perform(
                get("$baseUrl?code=${person.uuid}")
                    .with(user(CreateHelper.UserSecurity(admin)))
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
    }

    @Test
    fun `should get a sickday via GET-method`() {
        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm =
            SickDayForm(
                from = from,
                to = to,
                days = days.toMutableList(),
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = sickDayService.create(createForm)

        mvc
            .perform(
                get("$baseUrl/${created.code}")
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.description").value(description))
            .andExpect(jsonPath("\$.status").value(status.toString()))
            .andExpect(jsonPath("\$.hours").value(hours))
            .andExpect(jsonPath("\$.personId").value(person.uuid.toString()))
    }

    @Test
    fun `should create a valid sickday via POST-method with status REQUESTED`() {
        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm =
            SickDayForm(
                from = from,
                to = to,
                days = days.toMutableList(),
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(createForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.description").value(description))
            .andExpect(jsonPath("\$.status").value(status.toString()))
            .andExpect(jsonPath("\$.hours").value(hours))
            .andExpect(jsonPath("\$.personId").value(person.uuid.toString()))
    }

    @Test
    fun `should update a existing sickday via PUT-Method`() {
        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val updatedDescription = "All the leaves are brown"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm =
            SickDayForm(
                from = from,
                to = to,
                days = days.toMutableList(),
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = sickDayService.create(createForm)

        val updatedCreateForm = createForm.copy(description = updatedDescription)

        mvc
            .perform(
                put("$baseUrl/${created.code}")
                    .with(user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(updatedCreateForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.description").value(updatedDescription))
            .andExpect(jsonPath("\$.status").value(status.toString()))
            .andExpect(jsonPath("\$.hours").value(hours))
            .andExpect(jsonPath("\$.personId").value(person.uuid.toString()))
    }

    @Test
    fun `should not be allowed to update status field existing sickday via PUT-Method`() {
        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val updatedStatus = Status.APPROVED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm =
            SickDayForm(
                from = from,
                to = to,
                days = days.toMutableList(),
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = sickDayService.create(createForm)

        val updatedCreateForm = createForm.copy(status = updatedStatus)

        mvc
            .perform(
                put("$baseUrl/${created.code}")
                    .with(user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(updatedCreateForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isForbidden)

        assertEquals(sickDayService.findByCode(created.code)?.status, status)
    }

    @Test
    fun `admin can update status field existing sickday via PUT-Method`() {
        val admin = createHelper.createUser(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val updatedStatus = Status.APPROVED
        val person = createHelper.createPerson("john", "doe", admin.code)

        val createForm =
            SickDayForm(
                from = from,
                to = to,
                days = days.toMutableList(),
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = sickDayService.create(createForm)

        val updatedCreateForm = createForm.copy(status = updatedStatus)

        mvc
            .perform(
                put("$baseUrl/${created.code}")
                    .with(user(CreateHelper.UserSecurity(admin)))
                    .content(mapper.writeValueAsString(updatedCreateForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.status").value(updatedStatus.toString()))
    }

    @Test
    fun `should delete a sickday via DELETE-Method`() {
        val admin = createHelper.createUser(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", admin.code)

        val createForm =
            SickDayForm(
                from = from,
                to = to,
                days = days.toMutableList(),
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = sickDayService.create(createForm)

        mvc
            .perform(
                delete("$baseUrl/${created.code}")
                    .with(user(CreateHelper.UserSecurity(admin)))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isNoContent)

        assertNull(sickDayService.findByCode(created.code))
    }
}
