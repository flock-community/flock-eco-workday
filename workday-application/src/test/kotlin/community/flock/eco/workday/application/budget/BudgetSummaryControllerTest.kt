package community.flock.eco.workday.application.budget

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.ContractService
import community.flock.eco.workday.domain.budget.BudgetAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocationService
import community.flock.eco.workday.helpers.CreateHelper
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

class BudgetSummaryControllerTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var contractService: ContractService

    @Autowired
    private lateinit var hackTimeBudgetAllocationService: HackTimeBudgetAllocationService

    @Autowired
    private lateinit var studyTimeBudgetAllocationService: StudyTimeBudgetAllocationService

    @Autowired
    private lateinit var studyMoneyBudgetAllocationService: StudyMoneyBudgetAllocationService

    private val baseUrl = "/api/budget-summary"

    private val adminAuthorities =
        setOf(BudgetAllocationAuthority.READ, BudgetAllocationAuthority.WRITE, BudgetAllocationAuthority.ADMIN)
    private val userAuthorities =
        setOf(BudgetAllocationAuthority.READ, BudgetAllocationAuthority.WRITE)

    @Test
    fun `budget summary returns correct values for person with contract and allocations`() {
        val user = createHelper.createUser(adminAuthorities)
        val personEntity = createHelper.createPersonEntity("summary", "test", user.code)
        val person = personEntity.toDomain()

        // Create contract with hackHours=100, studyHours=80, studyMoney=2500
        createHelper.createContractInternal(
            person = personEntity,
            from = LocalDate.of(2026, 1, 1),
            to = LocalDate.of(2026, 12, 31),
            hackHours = 100,
            studyHours = 80,
            studyMoney = BigDecimal("2500.00"),
        )

        // Create hack time allocation: 8 hours used
        hackTimeBudgetAllocationService.create(
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

        // Create study time allocation: 4 hours used
        studyTimeBudgetAllocationService.create(
            StudyTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 2),
                description = "Study day",
                dailyTimeAllocations = listOf(
                    DailyTimeAllocation(LocalDate.of(2026, 3, 2), 4.0, BudgetAllocationType.STUDY),
                ),
                totalHours = 4.0,
            ),
        )

        // Create study money allocation: 500.00 used
        studyMoneyBudgetAllocationService.create(
            StudyMoneyBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 3),
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
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.budget").value(100.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.used").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.available").value(92.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyHours.budget").value(80.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyHours.used").value(4.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyHours.available").value(76.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoney.budget").value(2500.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoney.used").value(500.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoney.available").value(2000.0))
    }

    @Test
    fun `budget summary returns zeros when no contract exists`() {
        val user = createHelper.createUser(adminAuthorities)
        val person = createHelper.createPerson("nocontract", "test", user.code)

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?personId=${person.uuid}&year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.budget").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.available").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyHours.budget").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyHours.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyHours.available").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoney.budget").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoney.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoney.available").value(0.0))
    }

    @Test
    fun `non-admin user auto-scoped to own data`() {
        val user = createHelper.createUser(userAuthorities)
        val personEntity = createHelper.createPersonEntity("regular", "user", user.code)
        val person = personEntity.toDomain()

        createHelper.createContractInternal(
            person = personEntity,
            from = LocalDate.of(2026, 1, 1),
            to = LocalDate.of(2026, 12, 31),
            hackHours = 50,
            studyHours = 40,
            studyMoney = BigDecimal("1000.00"),
        )

        // Non-admin does not need personId param - auto-scoped
        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.budget").value(50.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyHours.budget").value(40.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.studyMoney.budget").value(1000.0))
    }

    @Test
    fun `admin can query any person budget summary`() {
        val adminUser = createHelper.createUser(adminAuthorities)
        val otherUser = createHelper.createUser(userAuthorities)
        val otherPersonEntity = createHelper.createPersonEntity("other", "person", otherUser.code)
        val otherPerson = otherPersonEntity.toDomain()

        createHelper.createContractInternal(
            person = otherPersonEntity,
            from = LocalDate.of(2026, 1, 1),
            to = LocalDate.of(2026, 12, 31),
            hackHours = 200,
            studyHours = 0,
            studyMoney = BigDecimal.ZERO,
        )

        // Admin queries other person's summary
        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?personId=${otherPerson.uuid}&year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(adminUser)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackHours.budget").value(200.0))
    }

    private fun ResultActions.asyncDispatch() =
        mvc.perform(
            MockMvcRequestBuilders.asyncDispatch(
                this.andReturn(),
            ),
        )
}
