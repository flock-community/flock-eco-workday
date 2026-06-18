package community.flock.eco.workday.application.budget

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.api.model.AllocationType
import community.flock.eco.workday.api.model.DailyTimeAllocationItem
import community.flock.eco.workday.api.model.MoneyAllocationInput
import community.flock.eco.workday.api.model.TimeAllocationInput
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocationService
import community.flock.eco.workday.domain.budget.TimeAllocation
import community.flock.eco.workday.domain.budget.TimeAllocationService
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.wirespec.integration.jackson.kotlin.WirespecModuleKotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.math.BigDecimal
import java.time.LocalDate
import community.flock.eco.workday.domain.budget.AllocationType as DomainAllocationType
import community.flock.eco.workday.api.model.UUID as UUIDApi

class BudgetAllocationControllerTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var timeAllocationService: TimeAllocationService

    @Autowired
    private lateinit var moneyAllocationService: MoneyAllocationService

    private val baseUrl = "/api/budget-allocations"

    private val adminAuthorities =
        setOf(BudgetAllocationAuthority.READ, BudgetAllocationAuthority.WRITE, BudgetAllocationAuthority.ADMIN)
    private val userAuthorities =
        setOf(BudgetAllocationAuthority.READ, BudgetAllocationAuthority.WRITE)
    private val readOnlyAuthorities =
        setOf(BudgetAllocationAuthority.READ)

    @Test
    fun `admin can GET time allocations by personId and year`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("alice", "budget", user.code)

        timeAllocationService.create(
            TimeAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Hack day",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, DomainAllocationType.HACK),
                    ),
            ),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?personId=${person.uuid}&year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].kind").value("TIME"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].personId").value(person.uuid.toString()))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].timeDetails.totalHours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].timeDetails.dailyAllocations[0].hours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].timeDetails.dailyAllocations[0].type").value("HACK"))
    }

    @Test
    fun `admin can GET a time allocation with mixed HACK and TRAINING daily rows`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("mixed", "time", user.code)

        timeAllocationService.create(
            TimeAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Mixed day",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 5.0, DomainAllocationType.HACK),
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 3.0, DomainAllocationType.TRAINING),
                    ),
            ),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?personId=${person.uuid}&year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].kind").value("TIME"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].timeDetails.totalHours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].timeDetails.dailyAllocations.length()").value(2))
    }

    @Test
    fun `admin can GET both time and money allocations together`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("all", "types", user.code)

        timeAllocationService.create(
            TimeAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 1, 1),
                description = "Hack day",
                dailyAllocations =
                    listOf(DailyTimeAllocation(LocalDate.of(2026, 1, 1), 8.0, DomainAllocationType.HACK)),
            ),
        )
        moneyAllocationService.create(
            MoneyAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Conference fee",
                amount = BigDecimal("500.00"),
            ),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?personId=${person.uuid}&year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(2))
    }

    @Test
    fun `admin can GET allocations by eventCode`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("bob", "budget", user.code)

        timeAllocationService.create(
            TimeAllocation(
                person = person,
                eventCode = "EVT-TEST-123",
                date = LocalDate.of(2026, 3, 1),
                description = "Event hack day",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 4.0, DomainAllocationType.HACK),
                    ),
            ),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?eventCode=EVT-TEST-123")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].eventCode").value("EVT-TEST-123"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].kind").value("TIME"))
    }

    @Test
    fun `admin can POST time allocation and receive response`() {
        val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("charlie", "budget", user.code)

        val input =
            TimeAllocationInput(
                personId = UUIDApi(person.uuid.toString()),
                eventCode = null,
                date = "2026-03-01",
                description = "TDD hack day",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocationItem("2026-03-01", 8.0, AllocationType.HACK),
                    ),
            )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .post("$baseUrl/time")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("$.personId").value(person.uuid.toString()))
            .andExpect(MockMvcResultMatchers.jsonPath("$.kind").value("TIME"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.timeDetails.totalHours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.timeDetails.dailyAllocations[0].hours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.timeDetails.dailyAllocations[0].type").value("HACK"))
    }

    @Test
    fun `admin can POST money allocation and receive response`() {
        val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("diana", "budget", user.code)

        val input =
            MoneyAllocationInput(
                personId = UUIDApi(person.uuid.toString()),
                eventCode = null,
                date = "2026-03-01",
                description = "Training budget",
                amount = 250.50,
                files = emptyList(),
            )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .post("$baseUrl/money")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("$.kind").value("MONEY"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.moneyDetails.amount").value(250.5))
    }

    @Test
    fun `admin can DELETE allocation by code`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("eve", "budget", user.code)

        val allocation =
            moneyAllocationService.create(
                MoneyAllocation(
                    person = person,
                    eventCode = null,
                    date = LocalDate.of(2026, 3, 1),
                    description = "To be deleted",
                    amount = BigDecimal("100.00"),
                ),
            )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .delete("$baseUrl/${allocation.code}")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isNoContent)
    }

    @Test
    fun `non-admin user receives 403 on POST mutation`() {
        val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
        val user = createHelper.createUser(readOnlyAuthorities)
        val person = createHelper.createPerson("frank", "budget", user.code)

        val input =
            TimeAllocationInput(
                personId = UUIDApi(person.uuid.toString()),
                eventCode = null,
                date = "2026-03-01",
                description = "Should fail",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocationItem("2026-03-01", 8.0, AllocationType.HACK),
                    ),
            )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .post("$baseUrl/time")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isForbidden)
    }

    @Test
    fun `non-admin user GET returns only own allocations`() {
        val adminUser = createHelper.createUser(adminAuthorities)
        val regularUser = createHelper.createUser(userAuthorities)

        val adminPerson = createHelper.createPerson("admin", "person", adminUser.code)
        val regularPerson = createHelper.createPerson("regular", "person", regularUser.code)

        timeAllocationService.create(
            TimeAllocation(
                person = adminPerson,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Admin's hack day",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, DomainAllocationType.HACK),
                    ),
            ),
        )

        timeAllocationService.create(
            TimeAllocation(
                person = regularPerson,
                eventCode = null,
                date = LocalDate.of(2026, 3, 2),
                description = "Regular's hack day",
                dailyAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 2), 4.0, DomainAllocationType.HACK),
                    ),
            ),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(regularUser)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.length()").value(1))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].personId").value(regularPerson.uuid.toString()))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].description").value("Regular's hack day"))
    }

    private fun ResultActions.asyncDispatch() =
        mvc.perform(
            MockMvcRequestBuilders.asyncDispatch(
                this.andReturn(),
            ),
        )
}
