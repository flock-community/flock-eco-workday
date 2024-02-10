package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.Application
import community.flock.eco.workday.authorities.LeaveDayAuthority
import community.flock.eco.workday.forms.LeaveDayForm
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.services.LeaveDayService
import config.AppTestConfig
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.ActiveProfiles
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

@SpringBootTest(classes = [Application::class, AppTestConfig::class], webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@AutoConfigureMockMvc
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class LeaveDayControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
    @Autowired private val leaveDayService: LeaveDayService,
) {
    private val baseUrl: String = "/api/leave-days"

    val adminAuthorities = setOf(LeaveDayAuthority.READ, LeaveDayAuthority.WRITE, LeaveDayAuthority.ADMIN)
    val userAuthorities = setOf(LeaveDayAuthority.READ, LeaveDayAuthority.WRITE)

    @Test
    fun `should get a holiday via GET-method`() {
        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm =
            LeaveDayForm(
                from = from,
                to = to,
                days = days,
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = leaveDayService.create(createForm)

        mvc.perform(
            get("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(user)))
                .accept(APPLICATION_JSON),
        )
            .andExpect(status().isOk)
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
    fun `should create a valid holiday via POST-method with status REQUESTED`() {
        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 3)
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", user.code)

        val createForm =
            LeaveDayForm(
                from = from,
                to = to,
                days = days,
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        mvc.perform(
            post(baseUrl)
                .with(user(CreateHelper.UserSecurity(user)))
                .content(mapper.writeValueAsString(createForm))
                .contentType(APPLICATION_JSON)
                .accept(APPLICATION_JSON),
        )
            .andExpect(status().isOk)
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
    fun `should update a existing holiday via PUT-Method`() {
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
            LeaveDayForm(
                from = from,
                to = to,
                days = days,
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = leaveDayService.create(createForm)

        val updatedCreateForm = createForm.copy(description = updatedDescription)

        mvc.perform(
            put("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(user)))
                .content(mapper.writeValueAsString(updatedCreateForm))
                .contentType(APPLICATION_JSON)
                .accept(APPLICATION_JSON),
        )
            .andExpect(status().isOk)
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
    fun `should not be allowed to update status field existing holiday via PUT-Method`() {
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
            LeaveDayForm(
                from = from,
                to = to,
                days = days,
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = leaveDayService.create(createForm)

        val updatedCreateForm = createForm.copy(status = updatedStatus)

        mvc.perform(
            put("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(user)))
                .content(mapper.writeValueAsString(updatedCreateForm))
                .contentType(APPLICATION_JSON)
                .accept(APPLICATION_JSON),
        )
            .andExpect(status().isForbidden)

        assertEquals(leaveDayService.findByCode(created.code)?.status, status)
    }

    @Test
    fun `admin can update status field existing holiday via PUT-Method`() {
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
            LeaveDayForm(
                from = from,
                to = to,
                days = days,
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = leaveDayService.create(createForm)

        val updatedCreateForm = createForm.copy(status = updatedStatus)

        mvc.perform(
            put("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(admin)))
                .content(mapper.writeValueAsString(updatedCreateForm))
                .contentType(APPLICATION_JSON)
                .accept(APPLICATION_JSON),
        )
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
        val days = listOf(6.0, 6.0, 6.0)
        val hours = 18.0
        val description = "Lucy in the sky with diamonds"
        val status = Status.REQUESTED
        val person = createHelper.createPerson("john", "doe", admin.code)

        val createForm =
            LeaveDayForm(
                from = from,
                to = to,
                days = days,
                hours = hours,
                personId = person.uuid,
                description = description,
                status = status,
            )

        val created = leaveDayService.create(createForm)

        mvc.perform(
            delete("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(admin)))
                .contentType(APPLICATION_JSON)
                .accept(APPLICATION_JSON),
        )
            .andExpect(status().isNoContent)

        assertNull(leaveDayService.findByCode(created.code))
    }
}
