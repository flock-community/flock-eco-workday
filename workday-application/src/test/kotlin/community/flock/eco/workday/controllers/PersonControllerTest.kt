package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserSecurityService
import org.hamcrest.Matchers
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.request.RequestPostProcessor
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID

class PersonControllerTest : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/persons"

    @Autowired
    private lateinit var mvc: MockMvc

    @Autowired
    private lateinit var mapper: ObjectMapper

    @Autowired
    private lateinit var userAccountService: UserAccountService

    @Autowired
    private lateinit var personService: PersonService

    @BeforeEach
    fun setUp() {
        createActiveAndInactivePerson()
    }

    private fun createActiveAndInactivePerson() {
        val activeUserForm =
            PersonForm(
                firstname = "Morris",
                lastname = "Moss",
                email = "morris@moss.com",
                position = "",
                number = null,
                userCode = null,
                active = true,
            )

        personService.create(activeUserForm)

        val inactiveUserForm =
            PersonForm(
                firstname = "Pieter",
                lastname = "Post",
                email = "pieter@post.nl",
                position = "",
                number = null,
                userCode = null,
                active = false,
            )

        personService.create(inactiveUserForm)
    }

    fun createUser(): RequestPostProcessor =
        UserAccountPasswordForm(
            email = UUID.randomUUID().toString(),
            name = "Administrator",
            authorities =
                setOf(
                    "PersonAuthority.ADMIN",
                    "PersonAuthority.READ",
                    "PersonAuthority.WRITE",
                ),
            password = "admin",
        ).run { userAccountService.createUserAccountPassword(this) }
            .run { UserSecurityService.UserSecurityPassword(this) }
            .run { user(this) }

    @Test
    fun `should create a valid person via POST-method`() {
        val personForm =
            PersonForm(
                firstname = "Morris",
                lastname = "Moss",
                email = "",
                position = "",
                number = null,
                userCode = null,
                active = true,
            )

        val user = createUser()

        mvc
            .perform(
                post(baseUrl)
                    .with(user)
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.id").exists())
            .andExpect(jsonPath("\$.uuid").exists())
            .andExpect(jsonPath("\$.uuid").exists())
            .andExpect(jsonPath("\$.firstname").value(personForm.firstname))
            .andExpect(jsonPath("\$.lastname").value(personForm.lastname))
            .andExpect(jsonPath("\$.email").isEmpty)
    }

    @Test
    fun `should get a person by code via GET-method`() {
        // DRY-Block
        val personForm =
            PersonForm(
                firstname = "Morris",
                lastname = "Moss",
                email = "",
                position = "",
                number = null,
                userCode = null,
                active = true,
            )

        val user = createUser()

        // need this user to compare generated fields
        // create a person so one can query that person via the PersonCode
        var person: JsonNode?
        mvc
            .perform(
                post(baseUrl)
                    .with(user)
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andReturn()
            .response
            .contentAsString
            .apply { person = mapper.readTree(this) }

        fun person(key: String): String = person!!.get(key).textValue()
        // DRY-Block

        mvc
            .perform(
                get("$baseUrl/${person("uuid")}")
                    .with(user)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.uuid").exists())
            .andExpect(jsonPath("\$.uuid").isString)
            .andExpect(jsonPath("\$.uuid").value(person("uuid")))
            .andExpect(jsonPath("\$.firstname").value(person("firstname")))
            .andExpect(jsonPath("\$.lastname").value(person("lastname")))
    }

    @Test
    fun `should update a valid person correctly via PUT-method`() {
        // DRY-Block
        val personForm =
            PersonForm(
                firstname = "Morris",
                lastname = "Moss",
                email = "",
                position = "",
                number = null,
                userCode = null,
                active = true,
            )

        // need this user to compare generated fields
        var person: JsonNode?
        val user = createUser()
        mvc
            .perform(
                post(baseUrl)
                    .with(user)
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andReturn()
            .response
            .contentAsString
            .apply { person = mapper.readTree(this) }

        fun person(key: String): String = person!!.get(key).textValue()
        // DRY-Block

        val personUpdate =
            PersonForm(
                firstname = "Morris",
                lastname = "Moss",
                email = "morris@reynholm-industires.co.uk",
                position = "",
                number = null,
                userCode = null,
                active = true,
            )

        mvc
            .perform(
                put("$baseUrl/${person("uuid")}")
                    .with(user)
                    .content(mapper.writeValueAsString(personUpdate))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.uuid").isNotEmpty)
            .andExpect(jsonPath("\$.uuid").isString)
            .andExpect(jsonPath("\$.uuid").value(person("uuid")))
            .andExpect(jsonPath("\$.firstname").value(personUpdate.firstname))
            .andExpect(jsonPath("\$.lastname").value(personUpdate.lastname))
            .andExpect(jsonPath("\$.email").isNotEmpty)
            .andExpect(jsonPath("\$.email").isString)
            .andExpect(jsonPath("\$.email").value(personUpdate.email))
    }

    @Test
    fun `should send a valid delete request to remove a person via DELETE-method`() {
        // DRY-Block
        val personForm =
            PersonForm(
                firstname = "Morris",
                lastname = "Moss",
                email = "",
                position = "",
                number = null,
                userCode = null,
                active = true,
            )

        // need this user to compare generated fields
        // create a person so one can query that person via the PersonCode
        var person: JsonNode?
        val user = createUser()
        mvc
            .perform(
                post(baseUrl)
                    .with(user)
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).andReturn()
            .response
            .contentAsString
            .apply { person = mapper.readTree(this) }

        fun person(key: String): String = person!!.get(key).textValue()

        mvc
            .perform(
                get("$baseUrl/${person("uuid")}")
                    .with(user)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("\$.uuid").exists())
            .andExpect(jsonPath("\$.uuid").isString)
            .andExpect(jsonPath("\$.uuid").value(person("uuid")))
            .andExpect(jsonPath("\$.firstname").value(person("firstname")))
            .andExpect(jsonPath("\$.lastname").value(person("lastname")))
        // DRY-Block

        mvc
            .perform(
                delete("$baseUrl/${person("uuid")}")
                    .with(user)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isNoContent)

        // DRY-Bock
        mvc
            .perform(get("$baseUrl/${person("uuid")}").with(user).accept(APPLICATION_JSON))
            .andExpect(status().isNotFound)
        // DRY-Bock
    }

    @Test
    fun `should return an error while trying to get a non-existing person via GET-request`() {
        val user = createUser()
        // DRY-Bock
        mvc
            .perform(
                get("$baseUrl/3b7ab8e2-aeeb-4228-98d8-bd22fa141caa")
                    .with(user)
                    .accept(APPLICATION_JSON),
            ).andExpect(status().isNotFound)
        // DRY-Bock
    }

    @Test
    fun `should return an error while trying to update a non-existing person via PUT-method`() {
        // TODO implement me
    }

    @Test
    fun `should return a 404 http status while trying to delete a non-existing person via DELETE-method`() {
        // TODO implement me
    }

    @Test
    fun `expect to retrieve a NOT_AUTHORIZED 403 return for gettings another person without admin permissions`() {
        // TODO implement me
    }

    @Test
    fun `expect to retrieve a NOT_AUTHORIZED 403 return for creating another person without admin permissions`() {
        // TODO implement me
    }

    @Test
    fun `expect to retrieve a NOT_AUTHORIZED 403 return for updating another person without admin permissions`() {
        // TODO implement me
    }

    @Test
    fun `expect to retrieve a NOT_AUTHORIZED 403 return for deleting another person without admin permissions`() {
        // TODO implement me
    }

    @Test
    fun `expect to retrieve only active users with active=true query param`() {
        val user = createUser()

        mvc
            .perform(
                get("$baseUrl?active=true")
                    .with(user)
                    .accept("application/json"),
            ).andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.*.active",
                    Matchers.everyItem(Matchers.`is`(true)),
                ),
            )
    }
}
