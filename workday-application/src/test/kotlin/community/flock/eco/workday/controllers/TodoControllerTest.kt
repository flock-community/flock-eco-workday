package community.flock.eco.workday.controllers

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.authorities.SickdayAuthority
import community.flock.eco.workday.application.authorities.TodoAuthority
import community.flock.eco.workday.application.authorities.WorkDayAuthority
import community.flock.eco.workday.application.expense.CostExpenseService
import community.flock.eco.workday.application.expense.ExpenseAuthority
import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.core.authorities.Authority
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.helpers.CreateHelper
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import java.util.UUID

class TodoControllerTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var workDayService: WorkDayService

    @Autowired
    private lateinit var leaveDayService: LeaveDayService

    @Autowired
    private lateinit var sickDayService: SickDayService

    @Autowired
    private lateinit var costExpenseService: CostExpenseService

    private val baseUrl: String = "/api/todos"

    val adminAuthorities =
        setOf<Authority>(
            TodoAuthority.READ,
            WorkDayAuthority.READ,
            WorkDayAuthority.WRITE,
            WorkDayAuthority.ADMIN,
            LeaveDayAuthority.READ,
            LeaveDayAuthority.WRITE,
            LeaveDayAuthority.ADMIN,
            SickdayAuthority.READ,
            SickdayAuthority.WRITE,
            SickdayAuthority.ADMIN,
            ExpenseAuthority.READ,
            ExpenseAuthority.WRITE,
            ExpenseAuthority.ADMIN,
        )

    val todoOnlyAuthorities = setOf<Authority>(TodoAuthority.READ)

    val workDayAuthorities = setOf<Authority>(TodoAuthority.READ, WorkDayAuthority.READ)
    val leaveDayAuthorities = setOf<Authority>(TodoAuthority.READ, LeaveDayAuthority.READ)
    val sickDayAuthorities = setOf<Authority>(TodoAuthority.READ, SickdayAuthority.READ)
    val expenseAuthorities = setOf<Authority>(TodoAuthority.READ, ExpenseAuthority.READ)

    @Test
    fun `should return 403 when user has no TodoAuthority READ`() {
        val user = createHelper.createUserEntity(setOf(WorkDayAuthority.READ))

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `should return empty list when user has TodoAuthority READ but no other authorities`() {
        val user = createHelper.createUserEntity(todoOnlyAuthorities)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(content().string("[]"))
    }

    @Test
    fun `admin should get all todos from all types`() {
        val user = createHelper.createUserEntity(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment = createHelper.createAssignment(client, person, from, to)
        val days = ChronoUnit.DAYS.between(from, to) + 1
        // Create a workday todo
        val workDayForm =
            WorkDayForm(
                from = from,
                to = to,
                assignmentCode = assignment.code,
                hours = 50.0,
                sheets = listOf(),
            )
        workDayService.create(workDayForm)

        // Create a leave day todo
        val leaveDayForm =
            LeaveDayForm(
                description = "Test leave day",
                from = from,
                to = to,
                hours = days * 8.0,
                days = (1..days).map { 8.0 }.toMutableList(),
                type = LeaveDayType.HOLIDAY,
                personId = person.uuid,
            )
        leaveDayService.create(leaveDayForm)

        // Create a sick day todo
        val sickDayForm =
            SickDayForm(
                from = from,
                to = to,
                hours = days * 8.0,
                days = (1..days).map { 8.0 }.toMutableList(),
                description = "Test sick day",
                personId = person.uuid,
            )
        sickDayService.create(sickDayForm)

        // Create an expense todo
        val costExpense =
            CostExpense(
                id = UUID.randomUUID(),
                description = "Test expense",
                status = Status.REQUESTED,
                date = from,
                person = person.toDomain(),
                amount = 100.0,
                files = emptyList(),
            )
        costExpenseService.create(costExpense)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(4))
            .andExpect(jsonPath("$[0].id").exists())
            .andExpect(jsonPath("$[0].personId").exists())
            .andExpect(jsonPath("$[0].personName").exists())
            .andExpect(jsonPath("$[0].todoType").exists())
            .andExpect(jsonPath("$[0].description").exists())
    }

    @Test
    fun `should return only workday todos when user has only WorkDayAuthority read`() {
        val user = createHelper.createUserEntity(workDayAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment = createHelper.createAssignment(client, person, from, to)
        val days = ChronoUnit.DAYS.between(from, to) + 1

        // Create a workday todo
        val workDayForm =
            WorkDayForm(
                from = from,
                to = to,
                assignmentCode = assignment.code,
                hours = 50.0,
                sheets = listOf(),
            )
        workDayService.create(workDayForm)

        // Create a leave day todo (should not be returned)
        val leaveDayForm =
            LeaveDayForm(
                description = "Test leave day",
                from = from,
                to = to,
                hours = days * 8.0,
                days = (1..days).map { 8.0 }.toMutableList(),
                type = LeaveDayType.HOLIDAY,
                personId = person.uuid,
            )
        leaveDayService.create(leaveDayForm)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].todoType").value("WORKDAY"))
    }

    @Test
    fun `should return only leaveday todos when user has only LeaveDayAuthority read`() {
        val user = createHelper.createUserEntity(leaveDayAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val person = createHelper.createPersonEntity()
        val days = ChronoUnit.DAYS.between(from, to) + 1

        // Create a leave day todo
        val leaveDayForm =
            LeaveDayForm(
                description = "Test leave day",
                from = from,
                to = to,
                hours = days * 8.0,
                days = (1..days).map { 8.0 }.toMutableList(),
                type = LeaveDayType.HOLIDAY,
                personId = person.uuid,
            )
        leaveDayService.create(leaveDayForm)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andDo { println(it.response.contentAsString) }
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].todoType").value("HOLIDAY"))
    }

    @Test
    fun `should return only sickday todos when user has only SickdayAuthority read`() {
        val user = createHelper.createUserEntity(sickDayAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val person = createHelper.createPersonEntity()
        val days = ChronoUnit.DAYS.between(from, to) + 1

        // Create a sick day todo
        val sickDayForm =
            SickDayForm(
                from = from,
                to = to,
                hours = days * 8.0,
                days = (1..days).map { 8.0 }.toMutableList(),
                description = "Test sick day",
                personId = person.uuid,
            )
        sickDayService.create(sickDayForm)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].todoType").value("SICKDAY"))
    }

    @Transactional
    @Test
    fun `should return only expense todos when user has only ExpenseAuthority read`() {
        val user = createHelper.createUserEntity(expenseAuthorities)
        val person = createHelper.createPersonEntity("Test", "User", user.code)
        // Create an expense todo
        val costExpense =
            CostExpense(
                id = UUID.randomUUID(),
                description = "Test expense",
                status = Status.REQUESTED,
                date = LocalDate.of(2020, 1, 1),
                person = person.toDomain(),
                amount = 100.0,
                files = emptyList(),
            )
        costExpenseService.create(costExpense)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].todoType").value("EXPENSE"))
    }

    @Test
    fun `should return todos sorted by personName and todoType`() {
        val user = createHelper.createUserEntity(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val days = ChronoUnit.DAYS.between(from, to) + 1

        val client = createHelper.createClient()

        // Create persons with different names to test sorting
        val personA = createHelper.createPersonEntity("Alice", "Smith")
        val personB = createHelper.createPersonEntity("Bob", "Johnson")

        val assignmentA = createHelper.createAssignment(client, personA, from, to)
        val assignmentB = createHelper.createAssignment(client, personB, from, to)

        // Create workdays for both persons
        workDayService.create(
            WorkDayForm(
                from = from,
                to = to,
                assignmentCode = assignmentA.code,
                hours = 50.0,
                sheets = listOf(),
            ),
        )

        workDayService.create(
            WorkDayForm(
                from = from,
                to = to,
                assignmentCode = assignmentB.code,
                hours = 50.0,
                sheets = listOf(),
            ),
        )

        // Create leave days for both persons
        leaveDayService.create(
            LeaveDayForm(
                description = "Test leave day A",
                from = from,
                to = to,
                hours = days * 8.0,
                days = (1..days).map { 8.0 }.toMutableList(),
                type = LeaveDayType.HOLIDAY,
                personId = personA.uuid,
            ),
        )

        leaveDayService.create(
            LeaveDayForm(
                description = "Test leave day B",
                from = from,
                to = to,
                hours = days * 8.0,
                days = (1..days).map { 8.0 }.toMutableList(),
                type = LeaveDayType.HOLIDAY,
                personId = personB.uuid,
            ),
        )

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(4))
            // Should be sorted by person name first: Alice Smith, Bob Johnson
            .andExpect(jsonPath("$[0].personName").value("Alice Smith"))
            .andExpect(jsonPath("$[1].personName").value("Alice Smith"))
            .andExpect(jsonPath("$[2].personName").value("Bob Johnson"))
            .andExpect(jsonPath("$[3].personName").value("Bob Johnson"))
    }

    @Test
    fun `should only return todos with REQUESTED status`() {
        val user = createHelper.createUserEntity(adminAuthorities)
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 3, 31)
        val client = createHelper.createClient()
        val person = createHelper.createPersonEntity()
        val assignment = createHelper.createAssignment(client, person, from, to)

        // Create a workday with APPROVED status (should not be returned)
        val approvedWorkDayForm =
            WorkDayForm(
                status = Status.APPROVED,
                from = from,
                to = to,
                assignmentCode = assignment.code,
                hours = 50.0,
                sheets = listOf(),
            )
        workDayService.create(approvedWorkDayForm)

        // Create a workday with REQUESTED status (should be returned)
        val requestedWorkDayForm =
            WorkDayForm(
                from = from,
                to = to,
                assignmentCode = assignment.code,
                hours = 40.0,
                sheets = listOf(),
            )
        workDayService.create(requestedWorkDayForm)

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(user)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andDo {
                println(it.response.contentAsString)
            }.andExpect(jsonPath("$").isArray)
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].todoType").value("WORKDAY"))
    }

    private fun ResultActions.asyncDispatch() = mvc.perform(asyncDispatch(this.andReturn()))
}
