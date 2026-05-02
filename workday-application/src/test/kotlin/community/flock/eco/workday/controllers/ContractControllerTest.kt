package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.ContractAuthority
import community.flock.eco.workday.application.forms.ContractExternalForm
import community.flock.eco.workday.application.forms.ContractInternalForm
import community.flock.eco.workday.application.forms.ContractManagementForm
import community.flock.eco.workday.application.forms.ContractServiceForm
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

class ContractControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/contracts"

    private val adminAuthorities =
        setOf(ContractAuthority.READ, ContractAuthority.WRITE, ContractAuthority.ADMIN)
    private val userAuthorities = setOf(ContractAuthority.READ, ContractAuthority.WRITE)

    @Test
    fun `admin should create a valid internal contract via POST-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()

        val form =
            ContractInternalForm(
                personId = person.uuid,
                monthlySalary = 5000.0,
                hoursPerWeek = 40,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
                holidayHours = 192,
                hackHours = 160,
                billable = true,
            )

        mvc
            .perform(
                post("/api/contracts-internal")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(form))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.code").exists())
            .andExpect(jsonPath("$.monthlySalary").value(form.monthlySalary))
            .andExpect(jsonPath("$.hoursPerWeek").value(form.hoursPerWeek))
            .andExpect(jsonPath("$.holidayHours").value(form.holidayHours))
            .andExpect(jsonPath("$.hackHours").value(form.hackHours))
            .andExpect(jsonPath("$.billable").value(form.billable))
            .andExpect(jsonPath("$.from").value(form.from.toString()))
            .andExpect(jsonPath("$.to").value(form.to.toString()))
            .andExpect(jsonPath("$.person.uuid").value(person.uuid.toString()))
    }

    @Test
    fun `admin should create a valid external contract via POST-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()

        val form =
            ContractExternalForm(
                personId = person.uuid,
                hourlyRate = 95.0,
                hoursPerWeek = 36,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
                billable = true,
            )

        mvc
            .perform(
                post("/api/contracts-external")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(form))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.code").exists())
            .andExpect(jsonPath("$.hourlyRate").value(form.hourlyRate))
            .andExpect(jsonPath("$.hoursPerWeek").value(form.hoursPerWeek))
            .andExpect(jsonPath("$.billable").value(form.billable))
            .andExpect(jsonPath("$.from").value(form.from.toString()))
            .andExpect(jsonPath("$.to").value(form.to.toString()))
            .andExpect(jsonPath("$.person.uuid").value(person.uuid.toString()))
    }

    @Test
    fun `admin should create a valid management contract via POST-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()

        val form =
            ContractManagementForm(
                personId = person.uuid,
                monthlyFee = 2500.0,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                post("/api/contracts-management")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(form))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.code").exists())
            .andExpect(jsonPath("$.monthlyFee").value(form.monthlyFee))
            .andExpect(jsonPath("$.from").value(form.from.toString()))
            .andExpect(jsonPath("$.to").value(form.to.toString()))
            .andExpect(jsonPath("$.person.uuid").value(person.uuid.toString()))
    }

    @Test
    fun `admin should create a valid service contract via POST-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)

        val form =
            ContractServiceForm(
                monthlyCosts = 1000.0,
                description = "Cloud hosting fee",
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                post("/api/contracts-service")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(form))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.code").exists())
            .andExpect(jsonPath("$.monthlyCosts").value(form.monthlyCosts))
            .andExpect(jsonPath("$.description").value(form.description))
            .andExpect(jsonPath("$.from").value(form.from.toString()))
            .andExpect(jsonPath("$.to").value(form.to.toString()))
    }

    @Test
    fun `admin should get contract by code via GET-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()
        val contract =
            createHelper.createContractInternal(
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                get("$baseUrl/${contract.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.code").value(contract.code))
            .andExpect(jsonPath("$.from").value(contract.from.toString()))
    }

    @Test
    fun `admin should update an internal contract via PUT-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()
        val contract =
            createHelper.createContractInternal(
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        val updateForm =
            ContractInternalForm(
                personId = person.uuid,
                monthlySalary = 6000.0,
                hoursPerWeek = 32,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2025, 12, 31),
                holidayHours = 200,
                hackHours = 100,
                billable = false,
            )

        mvc
            .perform(
                put("/api/contracts-internal/${contract.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(updateForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.monthlySalary").value(updateForm.monthlySalary))
            .andExpect(jsonPath("$.hoursPerWeek").value(updateForm.hoursPerWeek))
            .andExpect(jsonPath("$.holidayHours").value(updateForm.holidayHours))
            .andExpect(jsonPath("$.hackHours").value(updateForm.hackHours))
            .andExpect(jsonPath("$.billable").value(updateForm.billable))
            .andExpect(jsonPath("$.to").value(updateForm.to.toString()))
    }

    @Test
    fun `admin should update an external contract via PUT-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()
        val contract =
            createHelper.createContractExternal(
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        val updateForm =
            ContractExternalForm(
                personId = person.uuid,
                hourlyRate = 110.0,
                hoursPerWeek = 32,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2025, 12, 31),
                billable = false,
            )

        mvc
            .perform(
                put("/api/contracts-external/${contract.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(updateForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.hourlyRate").value(updateForm.hourlyRate))
            .andExpect(jsonPath("$.hoursPerWeek").value(updateForm.hoursPerWeek))
            .andExpect(jsonPath("$.billable").value(updateForm.billable))
    }

    @Test
    fun `admin should delete a contract via DELETE-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()
        val contract =
            createHelper.createContractInternal(
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                delete("$baseUrl/${contract.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isNoContent)
    }

    @Test
    fun `non-admin user should not be able to delete a contract`() {
        val regularUser = createHelper.createUserEntity(userAuthorities)
        val person = createHelper.createPersonEntity()
        val contract =
            createHelper.createContractInternal(
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                delete("$baseUrl/${contract.code}")
                    .with(user(CreateHelper.UserSecurity(regularUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `non-admin user should not be able to list all contracts`() {
        val regularUser = createHelper.createUserEntity(userAuthorities)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(regularUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `admin should find contracts by personId via GET-method`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity()
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
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
    fun `unauthorized user without contract authority should be forbidden`() {
        val unauthorizedUser = createHelper.createUserEntity(emptySet())
        val person = createHelper.createPersonEntity()
        val contract =
            createHelper.createContractInternal(
                person = person,
                from = LocalDate.of(2024, 1, 1),
                to = LocalDate.of(2024, 12, 31),
            )

        mvc
            .perform(
                get("$baseUrl/${contract.code}")
                    .with(user(CreateHelper.UserSecurity(unauthorizedUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
