package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.Application
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.services.WorkDayService
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
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import kotlin.test.assertEquals

@SpringBootTest(classes = [Application::class, AppTestConfig::class], webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@AutoConfigureWebClient
@AutoConfigureMockMvc
@Import(CreateHelper::class)
@ActiveProfiles(profiles = ["test"])
class WorkDayControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
    @Autowired private val workDayService: WorkDayService
) {

    private val baseUrl: String = "/api/workdays"

    val adminAuthorities = setOf(WorkDayAuthority.READ, WorkDayAuthority.WRITE, WorkDayAuthority.ADMIN)
    val userAuthorities = setOf(WorkDayAuthority.READ, WorkDayAuthority.WRITE)

    @Test
    fun `admin should get all workdays from a single user`() {

        val user = createHelper.createUser(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, person, from, to)

        val createForm = WorkDayForm(
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 50.0,
            sheets = listOf()
        )

        workDayService.create(createForm)

        mvc.perform(
            get("$baseUrl?personId=${person.uuid}")
                .with(user(CreateHelper.UserSecurity(user)))
                .accept(APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
    }

    @Test
    fun `user can only access its own workdays`() {

        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val personNotlinkedToUser = createHelper.createPerson()
        val assignment = createHelper.createAssignment(client, personNotlinkedToUser, from, to)

        val createForm = WorkDayForm(
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 50.0,
            sheets = listOf()
        )

        workDayService.create(createForm)

        mvc.perform(
            get("$baseUrl?personId=${personNotlinkedToUser.uuid}")
                .with(user(CreateHelper.UserSecurity(user)))
                .accept(APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(content().string("[]"))
    }

    @Test
    fun `should create a valid Workday via POST-method with status REQUESTED`() {

        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val status = Status.APPROVED
        val client = createHelper.createClient()
        val person = createHelper.createPerson("john", "doe", user.code)
        val assignment = createHelper.createAssignment(client, person, from, to)

        val createForm = WorkDayForm(
            status = status,
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 50.0,
            sheets = listOf()
        )

        val created = workDayService.create(createForm)

        mvc.perform(
            get("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(user)))
                .accept(APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.id").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("\$.code").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("\$.code").isString)
            .andExpect(MockMvcResultMatchers.jsonPath("\$.status").value(Status.REQUESTED.toString()))
    }

    @Test
    fun `should not be allowed to update status field existing holiday via PUT-Method`() {

        val user = createHelper.createUser(userAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val status = Status.REQUESTED
        val client = createHelper.createClient()
        val person = createHelper.createPerson("john", "doe", user.code)
        val assignment = createHelper.createAssignment(client, person, from, to)

        val createForm = WorkDayForm(
            status = status,
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 50.0,
            sheets = listOf()
        )

        val created = workDayService.create(createForm)

        val updatedForm = createForm.copy(status = Status.APPROVED)

        mvc.perform(
            MockMvcRequestBuilders.put("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(user)))
                .content(mapper.writeValueAsString(updatedForm))
                .contentType(APPLICATION_JSON)
                .accept(APPLICATION_JSON)
        )
            .andExpect(status().isForbidden)

        assertEquals(workDayService.findByCode(created.code)?.status, status)
    }

    @Test
    fun `admin can update status field existing wrokday via PUT-Method`() {

        val admin = createHelper.createUser(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val status = Status.REQUESTED
        val updatedStatus = Status.REJECTED
        val client = createHelper.createClient()
        val person = createHelper.createPerson("john", "doe", admin.code)
        val assignment = createHelper.createAssignment(client, person, from, to)

        val createForm = WorkDayForm(
            status = status,
            from = from,
            to = to,
            assignmentCode = assignment.code,
            hours = 50.0,
            sheets = listOf()
        )

        val created = workDayService.create(createForm)

        val updatedCreateForm = createForm.copy(status = updatedStatus)

        mvc.perform(
            MockMvcRequestBuilders.put("$baseUrl/${created.code}")
                .with(user(CreateHelper.UserSecurity(admin)))
                .content(mapper.writeValueAsString(updatedCreateForm))
                .contentType(APPLICATION_JSON)
                .accept(APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(MockMvcResultMatchers.jsonPath("\$.id").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("\$.code").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("\$.status").value(updatedStatus.toString()))
    }
}
