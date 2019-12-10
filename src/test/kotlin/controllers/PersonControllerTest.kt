package community.flock.eco.workday.controllers

import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.workday.Application
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.PersonService
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureMockMvc
@ActiveProfiles(profiles = ["test"])
class PersonControllerTest {
    private val baseUrl: String = "/api/persons"

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired

    @Autowired
    private lateinit var userAccountService: UserAccountService

    @Test
    fun `should return an empty list if querying the API endpoint persons with a GET-method for the first time`() {
        val user = UserAccountPasswordForm(
            email = "admin@reynholm-instudries.co.uk",
            name = "Administrator",
            authorities = setOf(),
            password = "admin")
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }

        mvc.perform(get(baseUrl)
            .with(user)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON_UTF8))
            .andExpect(jsonPath("\$.length()").value(0))
    }

    }

    @Test
    fun `should return an error while trying to get a non-existing person via GET-request`() {
    }

    @Test
    fun `should return an error while trying to update a non-existing person via PUT-method`() {
    }

    @Test
    fun `should return a 404 http status while trying to delete a non-existing person via DELETE-method`() {
    }

    private fun findUser(email: String) = user(userAccountService
            .findUserAccountPasswordByUserEmail(email)
            ?.let { UserSecurityService.UserSecurityPassword(it) })
}
