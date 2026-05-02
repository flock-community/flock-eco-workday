package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.AssignmentAuthority
import community.flock.eco.workday.application.forms.AssignmentForm
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toDomain
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

class AssignmentControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/assignments"

    private val adminAuthorities =
        setOf(AssignmentAuthority.READ, AssignmentAuthority.WRITE, AssignmentAuthority.ADMIN)
    private val userAuthorities = setOf(AssignmentAuthority.READ, AssignmentAuthority.WRITE)

    @Test
    fun `admin should create a valid assignment via POST-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val client = createHelper.createClient("FlockClient")
        val person = createHelper.createPersonEntity("john", "doe")

        val form =
            AssignmentForm(
                personId = person.uuid,
                clientCode = client.code,
                hourlyRate = 100.0,
                hoursPerWeek = 40,
                role = "Senior software engineer",
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(form))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.code").exists())
            .andExpect(jsonPath("$.role").value(form.role))
            .andExpect(jsonPath("$.hourlyRate").value(form.hourlyRate))
            .andExpect(jsonPath("$.hoursPerWeek").value(form.hoursPerWeek))
            .andExpect(jsonPath("$.from").value(form.from.toString()))
            .andExpect(jsonPath("$.to").value(form.to.toString()))
            .andExpect(jsonPath("$.client.code").value(client.code))
            .andExpect(jsonPath("$.person.uuid").value(person.uuid.toString()))
    }

    @Test
    fun `admin should get an assignment by code via GET-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment =
            createHelper.createAssignment(
                client = client,
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 6, 30),
            )

        mvc
            .perform(
                get("$baseUrl/${assignment.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.code").value(assignment.code))
            .andExpect(jsonPath("$.role").value(assignment.role))
            .andExpect(jsonPath("$.hourlyRate").value(assignment.hourlyRate))
            .andExpect(jsonPath("$.hoursPerWeek").value(assignment.hoursPerWeek))
    }

    @Test
    fun `admin should update an assignment via PUT-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment =
            createHelper.createAssignment(
                client = client,
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 6, 30),
            )

        val updateForm =
            AssignmentForm(
                personId = person.uuid,
                clientCode = client.code,
                hourlyRate = 150.0,
                hoursPerWeek = 32,
                role = "Principal engineer",
                from = LocalDate.of(2024, 2, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                put("$baseUrl/${assignment.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(updateForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.role").value(updateForm.role))
            .andExpect(jsonPath("$.hourlyRate").value(updateForm.hourlyRate))
            .andExpect(jsonPath("$.hoursPerWeek").value(updateForm.hoursPerWeek))
            .andExpect(jsonPath("$.from").value(updateForm.from.toString()))
            .andExpect(jsonPath("$.to").value(updateForm.to.toString()))
    }

    @Test
    fun `admin should delete an assignment via DELETE-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment =
            createHelper.createAssignment(
                client = client,
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 6, 30),
            )

        mvc
            .perform(
                delete("$baseUrl/${assignment.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isNoContent)
    }

    @Test
    fun `user without ADMIN authority should not be able to delete an assignment`() {
        val regularUser = createHelper.createUserEntity(userAuthorities)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment =
            createHelper.createAssignment(
                client = client,
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 6, 30),
            )

        mvc
            .perform(
                delete("$baseUrl/${assignment.code}")
                    .with(user(CreateHelper.UserSecurity(regularUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `admin should find all assignments by person via GET-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        createHelper.createAssignment(
            client = client,
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 6, 30),
        )

        mvc
            .perform(
                get("$baseUrl?personId=${person.uuid}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].person.uuid").value(person.uuid.toString()))
    }

    @Test
    fun `non-write user should see hourlyRate set to 0 when fetching by code`() {
        val readOnlyUser = createHelper.createUserEntity(setOf(AssignmentAuthority.READ))
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment =
            createHelper.createAssignment(
                client = client,
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 6, 30),
            )

        mvc
            .perform(
                get("$baseUrl/${assignment.code}")
                    .with(user(CreateHelper.UserSecurity(readOnlyUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(assignment.code))
            .andExpect(jsonPath("$.hourlyRate").value(0.0))
    }

    @Test
    fun `should require AssignmentAuthority READ to access endpoints`() {
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment =
            createHelper.createAssignment(
                client = client,
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 6, 30),
            )
        val unauthorizedUser = createHelper.createUserEntity(emptySet())

        mvc
            .perform(
                get("$baseUrl/${assignment.code}")
                    .with(user(CreateHelper.UserSecurity(unauthorizedUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
