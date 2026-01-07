package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.api.model.CostExpenseFileInput
import community.flock.eco.workday.api.model.CostExpenseInput
import community.flock.eco.workday.application.authorities.ExpenseAuthority
import community.flock.eco.workday.application.controllers.produce
import community.flock.eco.workday.application.services.CostExpenseService
import community.flock.eco.workday.application.services.TravelExpenseService
import community.flock.eco.workday.domain.Status
import community.flock.eco.workday.domain.common.Document
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.user.User
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toEntity
import community.flock.wirespec.integration.jackson.kotlin.WirespecModuleKotlin
import org.junit.jupiter.api.Nested
import org.junit.jupiter.api.Test
import org.junit.jupiter.params.ParameterizedTest
import org.junit.jupiter.params.provider.ValueSource
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
import java.util.UUID

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
                    get("$baseUrl/${created.id}")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isOk)
                .andExpect(content().contentType(APPLICATION_JSON))
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
                    status = community.flock.eco.workday.api.model.ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 1.23,
                    files =
                        listOf(
                            CostExpenseFileInput(
                                "a-test-file.flock",
                                community.flock.eco.workday.api.model.UUID(
                                    "38ba2264-ed3a-44c9-b691-ab47b7935c7c",
                                ),
                            ),
                        ),
                )

            mvc
                .perform(
                    post("/api/expenses-cost")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isOk)
                .andExpect(content().contentType(APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.personId").value(costExpenseInput.personId.value))
                .andExpect(jsonPath("$.description").value(costExpenseInput.description))
                .andExpect(jsonPath("$.date").value(costExpenseInput.date))
                .andExpect(jsonPath("$.status").value(costExpenseInput.status.toString()))
                .andExpect(jsonPath("$.expenseType").value("COST"))
                .andExpect(jsonPath("$.costDetails.amount").value(1.23))
                .andExpect(jsonPath("$.costDetails.files[0].name").value(costExpenseInput.files.first().name))
                .andExpect(
                    jsonPath("$.costDetails.files[0].file").value(
                        costExpenseInput.files
                            .first()
                            .file.value,
                    ),
                ).andExpect(jsonPath("$.travelDetails").doesNotExist())
        }

        @ParameterizedTest
        @ValueSource(strings = ["admin", "user"])
        fun `should delete a costExpense via DELETE-Method`(userType: String) {
            val authorities = if (userType == "admin") adminAuthorities else userAuthorities
            val user = createHelper.createUser(authorities)
            val expenseId = UUID.fromString("58674E0F-0B52-4D48-BCE4-BE493C3CBEBE")

            travelExpenseService.create(
                aTravelExpense(
                    user = user,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    delete("$baseUrl/$expenseId")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isNoContent)

            mvc
                .perform(
                    get("$baseUrl/$expenseId")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isNotFound)
        }

        @Test
        fun `A (non admin) user should not be able to see another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val expenseId = UUID.fromString("99BC1EDC-B34F-44CA-9846-6683555FD44F")

            travelExpenseService.create(
                aTravelExpense(
                    user = anotherUser,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    get("$baseUrl/$expenseId")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to modify another user's costExpense`() {
            val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val travelExpense =
                aTravelExpense(
                    user = anotherUser,
                    expenseId = UUID.fromString("9F19D717-45D5-4427-A5F6-A4626E36D40B"),
                )
            val created = travelExpenseService.create(travelExpense)

            val costExpenseInput =
                CostExpenseInput(
                    personId =
                        community.flock.eco.workday.api
                            .model
                            .UUID(created.person.uuid.toString()),
                    description = "updated description",
                    status = community.flock.eco.workday.api.model.ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 12.0,
                    files = listOf(),
                )

            mvc
                .perform(
                    put("/api/expenses-cost/${created.id}")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to delete another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val travelExpense =
                aTravelExpense(
                    user = anotherUser,
                    expenseId = UUID.fromString("45B29D6E-E563-444C-A789-DDCE15390D6C"),
                )
            val created = travelExpenseService.create(travelExpense)

            mvc
                .perform(
                    delete("$baseUrl/${created.id}")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isForbidden)
        }

        private fun aTravelExpense(
            user: User,
            expenseId: UUID = UUID.fromString("248F727C-3A23-4482-93F7-3AB977E33368"),
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
            andExpect(jsonPath("$.id").value(expense.id.toString()))
                .andExpect(jsonPath("$.personId").value(expense.person.uuid.toString()))
                .andExpect(jsonPath("$.description").value(expense.description))
                .andExpect(jsonPath("$.date").value(expense.date.toString()))
                .andExpect(jsonPath("$.status").value(expense.status.toString()))
                .andExpect(jsonPath("$.expenseType").value("TRAVEL"))
                .andExpect(jsonPath("$.costDetails").doesNotExist())
                .andExpect(jsonPath("$.travelDetails.distance").value(7.0))
                .andExpect(jsonPath("$.travelDetails.allowance").value(0.99))
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
                    get("$baseUrl/${created.id}")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isOk)
                .andExpect(content().contentType(APPLICATION_JSON))
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
                    status = community.flock.eco.workday.api.model.ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 1.23,
                    files =
                        listOf(
                            CostExpenseFileInput(
                                "a-test-file.flock",
                                community.flock.eco.workday.api.model.UUID(
                                    "38ba2264-ed3a-44c9-b691-ab47b7935c7c",
                                ),
                            ),
                        ),
                )

            mvc
                .perform(
                    post("/api/expenses-cost")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isOk)
                .andExpect(content().contentType(APPLICATION_JSON))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.personId").value(costExpenseInput.personId.value))
                .andExpect(jsonPath("$.description").value(costExpenseInput.description))
                .andExpect(jsonPath("$.date").value(costExpenseInput.date))
                .andExpect(jsonPath("$.status").value(costExpenseInput.status.toString()))
                .andExpect(jsonPath("$.expenseType").value("COST"))
                .andExpect(jsonPath("$.costDetails.amount").value(1.23))
                .andExpect(jsonPath("$.costDetails.files[0].name").value(costExpenseInput.files.first().name))
                .andExpect(
                    jsonPath("$.costDetails.files[0].file").value(
                        costExpenseInput.files
                            .first()
                            .file.value,
                    ),
                ).andExpect(jsonPath("$.travelDetails").doesNotExist())
        }

        @ParameterizedTest
        @ValueSource(strings = ["admin", "user"])
        fun `should delete a costExpense via DELETE-Method`(userType: String) {
            val authorities = if (userType == "admin") adminAuthorities else userAuthorities
            val user = createHelper.createUser(authorities)
            val expenseId = UUID.fromString("52142EDC-1DA2-4095-9694-D877108E1D97")

            costExpenseService.create(
                aCostExpense(
                    user = user,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    delete("$baseUrl/$expenseId")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isNoContent)

            mvc
                .perform(
                    get("$baseUrl/$expenseId")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isNotFound)
        }

        @Test
        fun `A (non admin) user should not be able to see another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val expenseId = UUID.fromString("CB4E3A6C-5710-44D7-A38A-E51D0912E8E9")

            costExpenseService.create(
                aCostExpense(
                    user = anotherUser,
                    expenseId = expenseId,
                ),
            )

            mvc
                .perform(
                    get("$baseUrl/$expenseId")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to modify another user's costExpense`() {
            val mapper = objectMapper.copy().registerModule(WirespecModuleKotlin())
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val costExpense =
                aCostExpense(
                    user = anotherUser,
                    expenseId = UUID.fromString("74D4B89D-B0D2-467C-966F-45CBBB19EB03"),
                )
            val created = costExpenseService.create(costExpense)

            val costExpenseInput =
                CostExpenseInput(
                    personId =
                        community.flock.eco.workday.api
                            .model
                            .UUID(created.person.uuid.toString()),
                    description = "updated description",
                    status = community.flock.eco.workday.api.model.ExpenseStatus.REQUESTED,
                    date = "2025-01-22",
                    amount = 12.0,
                    files = listOf(),
                )

            mvc
                .perform(
                    put("/api/expenses-cost/${created.id}")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .content(mapper.writeValueAsString(costExpenseInput))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isForbidden)
        }

        @Test
        fun `A (non admin) user should not be able to delete another user's costExpense`() {
            val user = createHelper.createUser(userAuthorities)
            val anotherUser = createHelper.createUser(userAuthorities)
            val costExpense =
                aCostExpense(
                    user = anotherUser,
                    expenseId = UUID.fromString("76548CE3-7501-4FA7-BBE2-D03CE515A3D8"),
                )
            val created = costExpenseService.create(costExpense)

            mvc
                .perform(
                    delete("$baseUrl/${created.id}")
                        .with(user(CreateHelper.UserSecurity(user.toEntity())))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isForbidden)
        }

        private fun aCostExpense(
            user: User,
            expenseId: UUID = UUID.fromString("633B24EA-D03F-424B-BC1B-83D6F53A071E"),
        ): CostExpense {
            val description = "Lucy in the sky with diamonds"
            val status = Status.REQUESTED
            val person = createHelper.createPerson("john", "doe", user.code)

            val date = LocalDate.of(2025, 1, 22)

            val filename = "a-test-file.flock"
            val fileId = UUID.fromString("38BA2264-ED3A-44C9-B691-AB47B7935C7C")

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
            andExpect(jsonPath("$.id").value(costExpense.id.toString()))
                .andExpect(jsonPath("$.personId").value(costExpense.person.uuid.toString()))
                .andExpect(jsonPath("$.description").value(costExpense.description))
                .andExpect(jsonPath("$.date").value(costExpense.date.toString()))
                .andExpect(jsonPath("$.status").value(costExpense.status.toString()))
                .andExpect(jsonPath("$.expenseType").value("COST"))
                .andExpect(jsonPath("$.costDetails.amount").value(1.23))
                .andExpect(jsonPath("$.costDetails.files[0].name").value(costExpense.files.first().name))
                .andExpect(
                    jsonPath("$.costDetails.files[0].file").value(
                        costExpense.files
                            .first()
                            .file
                            .toString(),
                    ),
                ).andExpect(jsonPath("$.travelDetails").doesNotExist())
    }

    private fun ResultActions.asyncDispatch() =
        mvc.perform(
            MockMvcRequestBuilders.asyncDispatch(
                this.andReturn(),
            ),
        )
}
