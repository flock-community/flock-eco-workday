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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class BudgetControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/budget-summary"

    @Test
    fun `returns 400 for a malformed personId`() {
        val account = createHelper.createUserEntity(setOf(AggregationAuthority.READ))

        mvc
            .perform(
                get("$baseUrl?personId=not-a-uuid")
                    .with(user(CreateHelper.UserSecurity(account.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
    }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
