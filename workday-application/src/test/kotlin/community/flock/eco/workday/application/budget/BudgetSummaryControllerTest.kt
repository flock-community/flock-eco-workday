package community.flock.eco.workday.application.budget

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.services.ContractService
import community.flock.eco.workday.domain.budget.BudgetAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.TrainingMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.TrainingMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocationService
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
    private lateinit var trainingTimeBudgetAllocationService: TrainingTimeBudgetAllocationService

    @Autowired
    private lateinit var trainingMoneyBudgetAllocationService: TrainingMoneyBudgetAllocationService

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

        createHelper.createContractInternal(
            person = personEntity,
            from = LocalDate.of(2026, 1, 1),
            to = LocalDate.of(2026, 12, 31),
            hackTimeBudget = 100,
            trainingTimeBudget = 80,
            trainingMoneyBudget = BigDecimal("2500.00"),
        )

        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "Hack day",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, BudgetAllocationType.HACK),
                    ),
                totalHours = 8.0,
            ),
        )

        trainingTimeBudgetAllocationService.create(
            TrainingTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 2),
                description = "Training day",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 2), 4.0, BudgetAllocationType.TRAINING),
                    ),
                totalHours = 4.0,
            ),
        )

        trainingMoneyBudgetAllocationService.create(
            TrainingMoneyBudgetAllocation(
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
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.budget").value(100.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.used").value(8.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.available").value(92.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.budget").value(80.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.used").value(4.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.available").value(76.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.budget").value(2500.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.used").value(500.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.available").value(2000.0))
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
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.budget").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.available").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.budget").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.available").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.budget").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.available").value(0.0))
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
            hackTimeBudget = 50,
            trainingTimeBudget = 40,
            trainingMoneyBudget = BigDecimal("1000.00"),
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.budget").value(50.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.budget").value(40.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.budget").value(1000.0))
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
            hackTimeBudget = 200,
            trainingTimeBudget = 0,
            trainingMoneyBudget = BigDecimal.ZERO,
        )

        mvc
            .perform(
                MockMvcRequestBuilders
                    .get("$baseUrl?personId=${otherPerson.uuid}&year=2026")
                    .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(adminUser)))
                    .accept(MediaType.APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(MockMvcResultMatchers.status().isOk)
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.budget").value(200.0))
    }

    @Test
    fun `multiple hack time allocations sum correctly for CALC-01`() {
        val user = createHelper.createUser(adminAuthorities)
        val personEntity = createHelper.createPersonEntity("calc01", "multi", user.code)
        val person = personEntity.toDomain()

        createHelper.createContractInternal(
            person = personEntity,
            from = LocalDate.of(2026, 1, 1),
            to = LocalDate.of(2026, 12, 31),
            hackTimeBudget = 100,
            trainingTimeBudget = 0,
            trainingMoneyBudget = BigDecimal.ZERO,
        )

        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "First hack day",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 8.0, BudgetAllocationType.HACK),
                    ),
                totalHours = 8.0,
            ),
        )

        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 4, 1),
                description = "Second hack day",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 4, 1), 12.0, BudgetAllocationType.HACK),
                    ),
                totalHours = 12.0,
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
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.budget").value(100.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.used").value(20.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.available").value(80.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.used").value(0.0))
    }

    @Test
    fun `training time allocation does not affect hack hours or training money for CALC-02`() {
        val user = createHelper.createUser(adminAuthorities)
        val personEntity = createHelper.createPersonEntity("calc02", "typeindep", user.code)
        val person = personEntity.toDomain()

        createHelper.createContractInternal(
            person = personEntity,
            from = LocalDate.of(2026, 1, 1),
            to = LocalDate.of(2026, 12, 31),
            hackTimeBudget = 100,
            trainingTimeBudget = 80,
            trainingMoneyBudget = BigDecimal("2500.00"),
        )

        trainingTimeBudgetAllocationService.create(
            TrainingTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 5, 1),
                description = "Training course",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 5, 1), 40.0, BudgetAllocationType.TRAINING),
                    ),
                totalHours = 40.0,
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
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.used").value(40.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingTimeBudget.available").value(40.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.available").value(100.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.used").value(0.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.trainingMoneyBudget.available").value(2500.0))
    }

    @Test
    fun `allocations from different year are excluded from budget calculation for CALC-03`() {
        val user = createHelper.createUser(adminAuthorities)
        val personEntity = createHelper.createPersonEntity("calc03", "yearscope", user.code)
        val person = personEntity.toDomain()

        createHelper.createContractInternal(
            person = personEntity,
            from = LocalDate.of(2025, 1, 1),
            to = LocalDate.of(2026, 12, 31),
            hackTimeBudget = 100,
            trainingTimeBudget = 0,
            trainingMoneyBudget = BigDecimal.ZERO,
        )

        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2025, 6, 1),
                description = "2025 hack day",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2025, 6, 1), 50.0, BudgetAllocationType.HACK),
                    ),
                totalHours = 50.0,
            ),
        )

        hackTimeBudgetAllocationService.create(
            HackTimeBudgetAllocation(
                person = person,
                eventCode = null,
                date = LocalDate.of(2026, 3, 1),
                description = "2026 hack day",
                dailyTimeAllocations =
                    listOf(
                        DailyTimeAllocation(LocalDate.of(2026, 3, 1), 20.0, BudgetAllocationType.HACK),
                    ),
                totalHours = 20.0,
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
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.budget").value(100.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.used").value(20.0))
            .andExpect(MockMvcResultMatchers.jsonPath("$.hackTimeBudget.available").value(80.0))
    }

    private fun ResultActions.asyncDispatch() =
        mvc.perform(
            MockMvcRequestBuilders.asyncDispatch(
                this.andReturn(),
            ),
        )
}
