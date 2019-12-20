package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.Application
import community.flock.eco.workday.forms.PersonForm
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.http.MediaType.APPLICATION_JSON_UTF8
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.request.RequestPostProcessor
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [Application::class])
@AutoConfigureMockMvc
@ActiveProfiles(profiles = ["test"])
class PersonControllerTest {
    private val baseUrl: String = "/api/persons"
    private val email: String = "admin@reynholm-instudries.co.uk"

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Autowired
    private lateinit var userAccountService: UserAccountService

    @Autowired
    private lateinit var userService: UserService

    private lateinit var user: RequestPostProcessor

    @Before
    fun setup() {
        user = UserAccountPasswordForm(
            email = email,
            name = "Administrator",
            authorities = setOf(),
            password = "admin")
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }
    }

    @After
    fun teardown() {
        userAccountService.findUserAccountPasswordByUserEmail(email)
            ?.apply { userService.delete(this.user.code) }
    }

    @Test
    fun `should create a valid person via POST-method`() {
        /* DRY-Block */
        val user = UserAccountPasswordForm(
            email = "admin@reynholm-instudries.co.uk",
            name = "Administrator",
            authorities = setOf(),
            password = "admin")
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }
        /* DRY-Block */

        // TODO: create arrayListOf<PersonForm>() of all possible valid persons
        val personForm = PersonForm(firstname = "Morris", lastname = "Moss", email = null)

        mvc.perform(post(baseUrl).with(user)
            .content(mapper.writeValueAsString(personForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON_UTF8))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.firstname").value(personForm.firstname))
            .andExpect(jsonPath("\$.lastname").value(personForm.lastname))
            .andExpect(jsonPath("\$.email").isEmpty)
    }

    @Test
    fun `should get a person by code via GET-method`() {
        /* DRY-Block */
        val user = UserAccountPasswordForm(
            email = "admin@reynholm-instudries.co.uk",
            name = "Administrator",
            authorities = setOf(),
            password = "admin")
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }

        val personForm = PersonForm(firstname = "Morris", lastname = "Moss", email = null)

        // need this user to compare generated fields
        // create a person so one can query that person via the PersonCode
        var person: JsonNode? = null
        mvc.perform(post(baseUrl).with(user)
            .content(mapper.writeValueAsString(personForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andReturn()
            .response
            .contentAsString
            .apply { person = mapper.readTree(this) }

        fun person(key: String): String = person!!.get(key).textValue()
        /* DRY-Block */

        mvc.perform(get("$baseUrl/${person("code")}")
            .with(user)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON_UTF8))
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.code").value(person("code")))
            .andExpect(jsonPath("\$.firstname").value(person("firstname")))
            .andExpect(jsonPath("\$.lastname").value(person("lastname")))
    }

    @Test
    fun `should update a valid person correctly via PUT-method`() {
        /* DRY-Block */
        val user = UserAccountPasswordForm(
            email = "admin@reynholm-instudries.co.uk",
            name = "Administrator",
            authorities = setOf(),
            password = "admin")
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }

        val personForm = PersonForm(firstname = "Morris", lastname = "Moss", email = null)

        // need this user to compare generated fields
        var person: JsonNode? = null
        mvc.perform(post(baseUrl).with(user)
            .content(mapper.writeValueAsString(personForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andReturn()
            .response
            .contentAsString
            .apply { person = mapper.readTree(this) }

        fun person(key: String): String = person!!.get(key).textValue()
        /* DRY-Block */

        val personUpdate = PersonForm(
            firstname = "Morris",
            lastname = "Moss",
            email = "morris@reynholm-industires.co.uk"
        )

        mvc.perform(put("$baseUrl/${person("code")}")
            .with(user)
            .content(mapper.writeValueAsString(personUpdate))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON_UTF8))
            .andExpect(jsonPath("\$.code").isNotEmpty)
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.code").value(person("code")))
            .andExpect(jsonPath("\$.firstname").value(personUpdate.firstname))
            .andExpect(jsonPath("\$.lastname").value(personUpdate.lastname))
            .andExpect(jsonPath("\$.email").isNotEmpty)
            .andExpect(jsonPath("\$.email").isString)
            .andExpect(jsonPath("\$.email").value(personUpdate.email))
    }

    @Test
    fun `should send a valid delete request to remove a person via DELETE-method`() {
        /* DRY-Block */
        val user = UserAccountPasswordForm(
            email = "admin@reynholm-instudries.co.uk",
            name = "Administrator",
            authorities = setOf(),
            password = "admin")
            .run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }

        val personForm = PersonForm(firstname = "Morris", lastname = "Moss", email = null)

        // need this user to compare generated fields
        // create a person so one can query that person via the PersonCode
        var person: JsonNode? = null
        mvc.perform(post(baseUrl).with(user)
            .content(mapper.writeValueAsString(personForm))
            .contentType(APPLICATION_JSON)
            .accept(APPLICATION_JSON))
            .andReturn()
            .response
            .contentAsString
            .apply { person = mapper.readTree(this) }

        fun person(key: String): String = person!!.get(key).textValue()

        mvc.perform(get("$baseUrl/${person("code")}")
            .with(user)
            .accept(APPLICATION_JSON))
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON_UTF8))
            .andExpect(jsonPath("\$.code").exists())
            .andExpect(jsonPath("\$.code").isString)
            .andExpect(jsonPath("\$.code").value(person("code")))
            .andExpect(jsonPath("\$.firstname").value(person("firstname")))
            .andExpect(jsonPath("\$.lastname").value(person("lastname")))
        /* DRY-Block */

        mvc.perform(delete("$baseUrl/${person("code")}")
            .with(user)
            .accept(APPLICATION_JSON))
            .andExpect(status().isNoContent)

        /* DRY-Bock */
        mvc.perform(get("$baseUrl/${person("code")}").with(user).accept(APPLICATION_JSON))
            .andExpect(status().isNotFound)
        /* DRY-Bock */
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
