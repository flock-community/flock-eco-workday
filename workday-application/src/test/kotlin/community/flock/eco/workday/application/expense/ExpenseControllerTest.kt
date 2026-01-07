package community.flock.eco.workday.application.expense

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.api.model.CostExpenseFileInput
import community.flock.eco.workday.api.model.CostExpenseInput
import community.flock.eco.workday.api.model.ExpenseStatus
import community.flock.eco.workday.api.model.UUID
import community.flock.eco.workday.application.controllers.produce
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.CostExpenseService
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.expense.TravelExpenseService
import community.flock.eco.workday.domain.user.User
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toEntity
import community.flock.wirespec.integration.jackson.kotlin.WirespecModuleKotlin
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.result.MockMvcResultMatchers
import java.time.LocalDate

class ExpenseControllerTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var costExpenseService: CostExpenseService

    @Autowired
    private lateinit var travelExpenseService: TravelExpenseService
    private val baseUrl: String = "/api/expenses"

    val adminAuthorities =
        setOf(ExpenseAuthority.READ, ExpenseAuthority.WRITE, ExpenseAuthority.ADMIN)
    val userAuthorities = setOf(ExpenseAuthority.READ, ExpenseAuthority.WRITE)

    @Nested
    inner class TravelExpenseTest {
        @Test
        fun `should get a travel expense via GET-method`() {
            val user = createHelper.createUser(userAuthorities)
            val travelExpense = aTravelExpense(user)
            val created = travelExpenseService.create(travelExpense)

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .get("$baseUrl/${created.id}")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpectBodyToMatch(travelExpense)
        }

        @Test
        fun `should create a valid cost expense via POST-method with status REQUESTED`() {
            val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
            val user = createHelper.createUser(userAuthorities)

            val person = createHelper.createPerson("john", "doe", user.code)
            val costExpenseInput =
                CostExpenseInput(
                    personId = person.uuid.produce(),
                    description = "Lucy in the sky with diamonds",
                    status = ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 1.23,
                    files =
                        listOf(
                            CostExpenseFileInput(
                                "a-test-file.flock",
                                UUID(
                                    "38ba2264-ed3a-44c9-b691-ab47b7935c7c",
                                ),
                            ),
                        ),
                )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .post("/api/expenses-cost")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.personId").value(costExpenseInput.personId.value))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(costExpenseInput.description))
                .andExpect(MockMvcResultMatchers.jsonPath("$.date").value(costExpenseInput.date))
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(costExpenseInput.status.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.expenseType").value("COST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.costDetails.amount").value(1.23))
                .andExpect(MockMvcResultMatchers.jsonPath("$.costDetails.files[0].name").value(costExpenseInput.files.first().name))
                .andExpect(
                    MockMvcResultMatchers.jsonPath("$.costDetails.files[0].file").value(
                        costExpenseInput.files
                            .first()
                            .file.value,
                    ),
                ).andExpect(MockMvcResultMatchers.jsonPath("$.travelDetails").doesNotExist())
        }

        @ParameterizedTest
        @ValueSource(strings = ["admin", "user"])
        fun `should delete a costExpense via DELETE-Method`(userType: String) {
            val authorities = if (userType == "admin") adminAuthorities else userAuthorities
            val user = createHelper.createUser(authorities)
            val expenseId = java.util.UUID.fromString("58674E0F-0B52-4D48-BCE4-BE493C3CBEBE")

            travelExpenseService.create(
                aTravelExpense(
                    user = user,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .delete("$baseUrl/$expenseId")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isNoContent)

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .get("$baseUrl/$expenseId")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isNotFound)
        }

        @Test
        fun `A (non admin) user should not be able to see another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val expenseId = java.util.UUID.fromString("99BC1EDC-B34F-44CA-9846-6683555FD44F")

            travelExpenseService.create(
                aTravelExpense(
                    user = anotherUser,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .get("$baseUrl/$expenseId")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to modify another user's costExpense`() {
            val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val travelExpense =
                aTravelExpense(
                    user = anotherUser,
                    expenseId = java.util.UUID.fromString("9F19D717-45D5-4427-A5F6-A4626E36D40B"),
                )
            val created = travelExpenseService.create(travelExpense)

            val costExpenseInput =
                CostExpenseInput(
                    personId =
                        UUID(created.person.uuid.toString()),
                    description = "updated description",
                    status = ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 12.0,
                    files = listOf(),
                )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .put("/api/expenses-cost/${created.id}")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to delete another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val travelExpense =
                aTravelExpense(
                    user = anotherUser,
                    expenseId = java.util.UUID.fromString("45B29D6E-E563-444C-A789-DDCE15390D6C"),
                )
            val created = travelExpenseService.create(travelExpense)

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .delete("$baseUrl/${created.id}")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isForbidden)
        }

        private fun aTravelExpense(
            user: User,
            expenseId: java.util.UUID = java.util.UUID.fromString("248F727C-3A23-4482-93F7-3AB977E33368"),
        ): TravelExpense {
            val description = "Travelling the stairway to heaven"
            val status = Status.REQUESTED
            val person = createHelper.createPerson("jane", "doe", user.code)

            val date = LocalDate.of(2025, 1, 23)

            return TravelExpense(
                description = description,
                status = status,
                id = expenseId,
                date = date,
                person = person,
                distance = 7.0,
                allowance = 0.99,
            )
        }

        private fun ResultActions.andExpectBodyToMatch(expense: TravelExpense): ResultActions =
            andExpect(MockMvcResultMatchers.jsonPath("$.id").value(expense.id.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.personId").value(expense.person.uuid.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(expense.description))
                .andExpect(MockMvcResultMatchers.jsonPath("$.date").value(expense.date.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(expense.status.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.expenseType").value("TRAVEL"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.costDetails").doesNotExist())
                .andExpect(MockMvcResultMatchers.jsonPath("$.travelDetails.distance").value(7.0))
                .andExpect(MockMvcResultMatchers.jsonPath("$.travelDetails.allowance").value(0.99))
    }

    @Nested
    inner class CostExpenseTest {
        @Test
        fun `should get a cost expense via GET-method`() {
            val user = createHelper.createUser(userAuthorities)
            val costExpense = aCostExpense(user)
            val created = costExpenseService.create(costExpense)

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .get("$baseUrl/${created.id}")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpectBodyToMatch(costExpense)
        }

        @Test
        fun `should create a valid cost expense via POST-method with status REQUESTED`() {
            val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
            val user = createHelper.createUser(userAuthorities)

            val person = createHelper.createPerson("john", "doe", user.code)
            val costExpenseInput =
                CostExpenseInput(
                    personId = person.uuid.produce(),
                    description = "Lucy in the sky with diamonds",
                    status = ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 1.23,
                    files =
                        listOf(
                            CostExpenseFileInput(
                                "a-test-file.flock",
                                UUID(
                                    "38ba2264-ed3a-44c9-b691-ab47b7935c7c",
                                ),
                            ),
                        ),
                )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .post("/api/expenses-cost")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isOk)
                .andExpect(MockMvcResultMatchers.content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(MockMvcResultMatchers.jsonPath("$.id").exists())
                .andExpect(MockMvcResultMatchers.jsonPath("$.personId").value(costExpenseInput.personId.value))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(costExpenseInput.description))
                .andExpect(MockMvcResultMatchers.jsonPath("$.date").value(costExpenseInput.date))
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(costExpenseInput.status.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.expenseType").value("COST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.costDetails.amount").value(1.23))
                .andExpect(MockMvcResultMatchers.jsonPath("$.costDetails.files[0].name").value(costExpenseInput.files.first().name))
                .andExpect(
                    MockMvcResultMatchers.jsonPath("$.costDetails.files[0].file").value(
                        costExpenseInput.files
                            .first()
                            .file.value,
                    ),
                ).andExpect(MockMvcResultMatchers.jsonPath("$.travelDetails").doesNotExist())
        }

        @ParameterizedTest
        @ValueSource(strings = ["admin", "user"])
        fun `should delete a costExpense via DELETE-Method`(userType: String) {
            val authorities = if (userType == "admin") adminAuthorities else userAuthorities
            val user = createHelper.createUser(authorities)
            val expenseId = java.util.UUID.fromString("52142EDC-1DA2-4095-9694-D877108E1D97")

            costExpenseService.create(
                aCostExpense(
                    user = user,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .delete("$baseUrl/$expenseId")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isNoContent)

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .get("$baseUrl/$expenseId")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isNotFound)
        }

        @Test
        fun `A (non admin) user should not be able to see another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val expenseId = java.util.UUID.fromString("CB4E3A6C-5710-44D7-A38A-E51D0912E8E9")

            costExpenseService.create(
                aCostExpense(
                    user = anotherUser,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .get("$baseUrl/$expenseId")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to modify another user's costExpense`() {
            val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val costExpense =
                aCostExpense(
                    user = anotherUser,
                    expenseId = java.util.UUID.fromString("74D4B89D-B0D2-467C-966F-45CBBB19EB03"),
                )
            val created = costExpenseService.create(costExpense)

            val costExpenseInput =
                CostExpenseInput(
                    personId =
                        UUID(created.person.uuid.toString()),
                    description = "updated description",
                    status = ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 12.0,
                    files = listOf(),
                )

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .put("/api/expenses-cost/${created.id}")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to delete another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val costExpense =
                aCostExpense(
                    user = anotherUser,
                    expenseId = java.util.UUID.fromString("76548CE3-7501-4FA7-BBE2-D03CE515A3D8"),
                )
            val created = costExpenseService.create(costExpense)

            mvc
                .perform(
                    MockMvcRequestBuilders
                        .delete("$baseUrl/${created.id}")
                        .with(SecurityMockMvcRequestPostProcessors.user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(MockMvcResultMatchers.status().isForbidden)
        }

        private fun aCostExpense(
            user: User,
            expenseId: java.util.UUID = java.util.UUID.fromString("633B24EA-D03F-424B-BC1B-83D6F53A071E"),
        ): CostExpense {
            val description = "Lucy in the sky with diamonds"
            val status = Status.REQUESTED
            val person = createHelper.createPerson("john", "doe", user.code)

            val date = LocalDate.of(2025, 1, 22)

            val filename = "a-test-file.flock"
            val fileId = java.util.UUID.fromString("38BA2264-ED3A-44C9-B691-AB47B7935C7C")

            return CostExpense(
                description = description,
                status = status,
                id = expenseId,
                date = date,
                person = person,
                amount = 1.23,
                files = mutableListOf(Document(filename, fileId)),
            )
        }

        private fun ResultActions.andExpectBodyToMatch(costExpense: CostExpense): ResultActions =
            andExpect(MockMvcResultMatchers.jsonPath("$.id").value(costExpense.id.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.personId").value(costExpense.person.uuid.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.description").value(costExpense.description))
                .andExpect(MockMvcResultMatchers.jsonPath("$.date").value(costExpense.date.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.status").value(costExpense.status.toString()))
                .andExpect(MockMvcResultMatchers.jsonPath("$.expenseType").value("COST"))
                .andExpect(MockMvcResultMatchers.jsonPath("$.costDetails.amount").value(1.23))
                .andExpect(MockMvcResultMatchers.jsonPath("$.costDetails.files[0].name").value(costExpense.files.first().name))
                .andExpect(
                    MockMvcResultMatchers.jsonPath("$.costDetails.files[0].file").value(
                        costExpense.files
                            .first()
                            .file
                            .toString(),
                    ),
                ).andExpect(MockMvcResultMatchers.jsonPath("$.travelDetails").doesNotExist())
    }

    private fun ResultActions.asyncDispatch() =
        mvc.perform(
            MockMvcRequestBuilders.asyncDispatch(
                this.andReturn(),
            ),
        )
}
