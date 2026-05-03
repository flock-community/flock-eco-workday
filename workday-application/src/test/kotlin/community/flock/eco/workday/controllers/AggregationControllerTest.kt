package community.flock.eco.workday.controllers

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.AggregationAuthority
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toDomain
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate

class AggregationControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/aggregations"

    private val readAuthorities = setOf(AggregationAuthority.READ)

    @Test
    fun `should return revenue per client by year`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val client = createHelper.createClient("FlockClient")
        val person = createHelper.createPersonEntity()
        createHelper.createAssignment(
            client = client,
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/total-per-client?year=2024")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[?(@.name == 'FlockClient')]").exists())
    }

    @Test
    fun `should return totals per person by year`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val person = createHelper.createPersonEntity("Jesse", "Pinkman")
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/total-per-person?year=2024")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[0].name").value("Jesse Pinkman"))
    }

    @Test
    fun `should return totals per person by year and month`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val person = createHelper.createPersonEntity("Walter", "White")
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/total-per-person?year=2024&month=3")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[0].name").value("Walter White"))
    }

    @Test
    fun `should return totals per month by year`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val person = createHelper.createPersonEntity()
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/total-per-month?year=2024")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(12))
    }

    @Test
    fun `should return leave-day report by year`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val person = createHelper.createPersonEntity("Holiday", "Person")
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/leave-day-report?year=2024")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[0].name").value("Holiday Person"))
            .andExpect(jsonPath("$[0].contractHours").exists())
    }

    @Test
    fun `should return hack-day report by year`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val person = createHelper.createPersonEntity("Hack", "Person")
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/hack-day-report?year=2024")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[0].name").value("Hack Person"))
            .andExpect(jsonPath("$[0].contractHours").exists())
    }

    @Test
    fun `should return client hour overview by year and month`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val client = createHelper.createClient("OverviewClient")
        val person = createHelper.createPersonEntity("Bob", "Builder")
        val from = LocalDate.of(2024, 6, 1)
        val to = LocalDate.of(2024, 6, 30)
        val assignment = createHelper.createAssignment(client, person, from, to)
        createHelper.createWorkDay(assignment, from, from.plusDays(4))

        mvc
            .perform(
                get("$baseUrl/client-hour-overview?year=2024&month=6")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[?(@.client.name == 'OverviewClient')]").exists())
    }

    @Test
    fun `should return client assignment hour overview by date range`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val client = createHelper.createClient("AssignmentClient")
        val person = createHelper.createPersonEntity("Alice", "Wonder")
        val from = LocalDate.of(2024, 6, 1)
        val to = LocalDate.of(2024, 6, 30)
        val assignment = createHelper.createAssignment(client, person, from, to)
        createHelper.createWorkDay(assignment, from, from.plusDays(4))

        mvc
            .perform(
                get("$baseUrl/client-assignment-hour-overview?from=2024-06-01&to=2024-06-30")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$[?(@.client.name == 'AssignmentClient')]").exists())
    }

    @Test
    fun `should return non-productive hours per day for person`() {
        val adminUser = createHelper.createUserEntity(readAuthorities)
        val person = createHelper.createPersonEntity()
        val from = LocalDate.of(2024, 6, 3)
        val to = LocalDate.of(2024, 6, 7)
        createHelper.createSickDay(person, from, to)

        mvc
            .perform(
                get("$baseUrl/person-nonproductive-hours-per-day?personId=${person.uuid}&from=2024-06-01&to=2024-06-30")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
    }

    @Test
    fun `should return totals per person me by year month`() {
        val regularUser = createHelper.createUserEntity(emptySet())
        val person = createHelper.createPersonEntity("Me", "User", regularUser.code)
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/total-per-person-me")
                    .with(user(CreateHelper.UserSecurity(regularUser.toDomain())))
                    .accept(APPLICATION_JSON),
            )
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
    }

    @Test
    fun `should return holiday details me by year`() {
        val regularUser = createHelper.createUserEntity(emptySet())
        val person = createHelper.createPersonEntity("Holiday", "Me", regularUser.code)
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/holiday-details-me?year=2024")
                    .with(user(CreateHelper.UserSecurity(regularUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.name").value("Holiday Me"))
            .andExpect(jsonPath("$.holidayHoursFromContract").exists())
    }

    @Test
    fun `should return hackday details me by year`() {
        val regularUser = createHelper.createUserEntity(emptySet())
        val person = createHelper.createPersonEntity("Hack", "Me", regularUser.code)
        createHelper.createContractInternal(
            person = person,
            from = LocalDate.of(2024, 1, 1),
            to = LocalDate.of(2024, 12, 31),
        )

        mvc
            .perform(
                get("$baseUrl/hackday-details-me?year=2024")
                    .with(user(CreateHelper.UserSecurity(regularUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.name").value("Hack Me"))
            .andExpect(jsonPath("$.hackHoursFromContract").exists())
    }

    @Test
    fun `holiday-details-me should return forbidden when user has no linked person`() {
        val regularUser = createHelper.createUserEntity(emptySet())

        mvc
            .perform(
                get("$baseUrl/holiday-details-me?year=2024")
                    .with(user(CreateHelper.UserSecurity(regularUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `should return forbidden when user has no AggregationAuthority READ`() {
        val unauthorizedUser = createHelper.createUserEntity(emptySet())

        mvc
            .perform(
                get("$baseUrl/total-per-client?year=2024")
                    .with(user(CreateHelper.UserSecurity(unauthorizedUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }
    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
