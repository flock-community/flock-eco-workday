package community.flock.eco.workday.controllers

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.services.UserAccountService
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

@TestPropertySource(
    properties = [
        "spring.session.jdbc.initialize-schema=always",
        "spring.session.jdbc.schema=classpath:org/springframework/session/jdbc/schema-h2.sql",
    ],
)
class ApiKeyAuthenticationTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var userAccountService: UserAccountService

    private fun createUserAndGenerateKey(label: String = "test-key"): Pair<String, UserAccountService.GeneratedKey> {
        val email = "${UUID.randomUUID()}@test.com"
        val account =
            userAccountService.createUserAccountPassword(
                UserAccountPasswordForm(
                    email = email,
                    name = "Test User",
                    authorities = setOf(),
                    password = "password",
                ),
            )
        val userCode = account.user.code
        val generatedKey = userAccountService.generateKeyForUserCode(userCode, label)!!
        return userCode to generatedKey
    }

    @Test
    fun `should authenticate with valid API token and return user details`() {
        val (_, generatedKey) = createUserAndGenerateKey()

        mvc
            .perform(
                get("/api/users/me")
                    .header("Authorization", "TOKEN ${generatedKey.plainKey}"),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Test User"))
    }

    @Test
    fun `should reject request with invalid API token`() {
        // 401 (was 3xx before the OpaqueTokenIntrospector wiring landed): with two entry points
        // registered, Spring's DelegatingAuthenticationEntryPoint picks the OAuth2 resource-server
        // matcher for non-HTML requests, which is the correct REST semantic.
        mvc
            .perform(
                get("/api/users/me")
                    .header("Authorization", "TOKEN invalid-key"),
            ).andExpect(status().isUnauthorized)
    }

    @Test
    fun `should reject request after API key is revoked`() {
        val (userCode, generatedKey) = createUserAndGenerateKey()

        // Verify the key works before revoking
        mvc
            .perform(
                get("/api/users/me")
                    .header("Authorization", "TOKEN ${generatedKey.plainKey}"),
            ).asyncDispatch()
            .andExpect(status().isOk)

        // Revoke the key
        userAccountService.revokeKeyByIdForUserCode(userCode, generatedKey.id)

        // Verify the key no longer works (401, see note above on the invalid-token test).
        mvc
            .perform(
                get("/api/users/me")
                    .header("Authorization", "TOKEN ${generatedKey.plainKey}"),
            ).andExpect(status().isUnauthorized)
    }

    private fun ResultActions.asyncDispatch() = mvc.perform(asyncDispatch(this.andReturn()))
}
