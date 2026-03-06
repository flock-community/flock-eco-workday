package community.flock.eco.workday.application.budget

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.api.model.DailyAllocationType
import community.flock.eco.workday.api.model.DailyTimeAllocationItem
import community.flock.eco.workday.api.model.HackTimeAllocationInput
import community.flock.eco.workday.api.model.StudyMoneyAllocationInput
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.BudgetAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocationService
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
import community.flock.eco.workday.api.model.UUID as UUIDApi

class BudgetAllocationControllerTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var budgetAllocationService: BudgetAllocationService

    @Autowired
    private lateinit var hackTimeBudgetAllocationService: HackTimeBudgetAllocationService

    @Autowired
    private lateinit var studyMoneyBudgetAllocationService: StudyMoneyBudgetAllocationService

    private val baseUrl = "/api/budget-allocations"

    private val adminAuthorities =
        setOf(BudgetAllocationAuthority.READ, BudgetAllocationAuthority.WRITE, BudgetAllocationAuthority.ADMIN)
    private val userAuthorities =
        setOf(BudgetAllocationAuthority.READ, BudgetAllocationAuthority.WRITE)
    private val readOnlyAuthorities =
        setOf(BudgetAllocationAuthority.READ)

    @Test
    fun `admin can GET allocations by personId and year`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("alice", "budget", user.code)

        val allocation = hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Hack day",
                dailyTimeAllocations = listOf(
                    DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, BudgetAllocationType.HACK),
                ),
                totalHours = 8.0,
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
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].type").value("HACK_TIME"))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].personId").value(person.uuid.toString()))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].hackTimeDetails.totalHours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].hackTimeDetails.dailyAllocations[0].hours").value(8.0))
    }

    @Test
    fun `admin can GET allocations by eventCode`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("bob", "budget", user.code)

        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = "EVT-TEST-123",
                date = LocalDate.of(2026, 3, 1),
                description = "Event hack day",
                dailyTimeAllocations = listOf(
                    DailyTimeAllocation(LocalDate.of(2026, 3, 1), 4.0, BudgetAllocationType.HACK),
                ),
                totalHours = 4.0,
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
            .andExpect(MockMvcResultMatchers.jsonPath("$[0].type").value("HACK_TIME"))
    }

    @Test
    fun `admin can POST hack-time allocation and receive response`() {
        val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("charlie", "budget", user.code)

        val input = HackTimeAllocationInput(
            personId = UUIDApi(person.uuid.toString()),
            eventCode = null,
            date = "2026-03-01",
            description = "TDD hack day",
            dailyAllocations = listOf(
                DailyTimeAllocationItem("2026-03-01", 8.0, DailyAllocationType.HACK),
            ),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .post("$baseUrl/hack-time")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("$.personId").value(person.uuid.toString()))
            .andExpect(MockMvcResultMatchers.jsonPath("$.type").value("HACK_TIME"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeDetails.totalHours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeDetails.dailyAllocations[0].hours").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeDetails.dailyAllocations[0].type").value("HACK"))
    }

    @Test
    fun `admin can POST study-money allocation and receive response`() {
        val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("diana", "budget", user.code)

        val input = StudyMoneyAllocationInput(
            personId = UUIDApi(person.uuid.toString()),
            eventCode = null,
            date = "2026-03-01",
            description = "Study budget",
            amount = 250.50,
            files = emptyList(),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .post("$baseUrl/study-money")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .content(mapper.writeValueAsString(input))
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
            .andExpect(MockMvcResultMatchers.jsonPath("$.type").value("STUDY_MONEY"))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoneyDetails.amount").value(250.5))
    }

    @Test
    fun `admin can DELETE allocation`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("eve", "budget", user.code)

        val allocation = studyMoneyBudgetAllocationService.create(
            StudyMoneyBudgetAllocation(
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
                    .delete("$baseUrl/${allocation.id}")
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

        val input = HackTimeAllocationInput(
            personId = UUIDApi(person.uuid.toString()),
            eventCode = null,
            date = "2026-03-01",
            description = "Should fail",
            dailyAllocations = listOf(
                DailyTimeAllocationItem("2026-03-01", 8.0, DailyAllocationType.HACK),
            ),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .post("$baseUrl/hack-time")
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

        // Create allocation for admin person
        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = adminPerson,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Admin's hack day",
                dailyTimeAllocations = listOf(
                    DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, BudgetAllocationType.HACK),
                ),
                totalHours = 8.0,
            ),
        )

        // Create allocation for regular person
        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = regularPerson,
                eventCode = null,
                date = LocalDate.of(2026, 3, 2),
                description = "Regular's hack day",
                dailyTimeAllocations = listOf(
                    DailyTimeAllocation(LocalDate.of(2026, 3, 2), 4.0, BudgetAllocationType.HACK),
                ),
                totalHours = 4.0,
            ),
        )

        // Regular user should only see their own allocation
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
