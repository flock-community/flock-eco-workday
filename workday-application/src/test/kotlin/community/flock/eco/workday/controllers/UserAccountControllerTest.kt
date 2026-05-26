package community.flock.eco.workday.controllers

import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.authorities.UserAuthority
import community.flock.eco.workday.user.repositories.UserAccountRepository
import community.flock.eco.workday.user.services.UserAccountService
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class UserAccountControllerTest : WorkdayIntegrationTest() {
    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var createHelper: CreateHelper

    @Autowired
    private lateinit var userAccountService: UserAccountService

    @Autowired
    private lateinit var userAccountRepository: UserAccountRepository

    private val baseUrl: String = "/api/user-accounts"

    @Test
    fun `should delete a user account when user has UserAuthority WRITE`() {
        val admin = createHelper.createUser(setOf(UserAuthority.READ, UserAuthority.WRITE))
        val target = createHelper.createUser(emptySet())
        val account = userAccountService.generateKeyForUserCode(target.code, "test-key")!!

        assertTrue(userAccountRepository.existsById(account.id))

        mvc
            .perform(
                delete("$baseUrl/${account.id}")
                    .with(user(CreateHelper.UserSecurity(admin)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)

        assertFalse(userAccountRepository.existsById(account.id))
    }

    @Test
    fun `should return 403 when user has no UserAuthority WRITE`() {
        val reader = createHelper.createUser(setOf(UserAuthority.READ))
        val target = createHelper.createUser(emptySet())
        val account = userAccountService.generateKeyForUserCode(target.code, "test-key")!!

        mvc
            .perform(
                delete("$baseUrl/${account.id}")
                    .with(user(CreateHelper.UserSecurity(reader)))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)

        assertTrue(userAccountRepository.existsById(account.id))
    }

    private fun ResultActions.asyncDispatch() = mvc.perform(asyncDispatch(this.andReturn()))
}
