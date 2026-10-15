package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.forms.PersonForm
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.domain.person.Address
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
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
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
            ).asyncDispatch()
            .andExpect(status().isOk)
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
            ).asyncDispatch()
            .andReturn()
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
            ).asyncDispatch()
            .andExpect(status().isOk)
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
            ).asyncDispatch()
            .andReturn()
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
            ).asyncDispatch()
            .andExpect(status().isOk)
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
            ).asyncDispatch()
            .andReturn()
            .response
            .contentAsString
            .apply { person = mapper.readTree(this) }

        fun person(key: String): String = person!!.get(key).textValue()

        mvc
            .perform(
                get("$baseUrl/${person("uuid")}")
                    .with(user)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
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
            ).asyncDispatch()
            .andExpect(status().isNoContent)

        // DRY-Bock
        mvc
            .perform(get("$baseUrl/${person("uuid")}").with(user).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
        // DRY-Bock
    }

    @Test
    fun `should store a trimmed and normalised Dutch address via POST-method`() {
        val personForm =
            aPersonForm().copy(
                address =
                    Address(
                        street = " Sesamstraat ",
                        houseNumber = " 12 ",
                        houseNumberAddition = " A ",
                        postalCode = "1234ab",
                        city = " Hilversum ",
                    ),
            )

        mvc
            .perform(
                post(baseUrl)
                    .with(createUser())
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.address.street").value("Sesamstraat"))
            .andExpect(jsonPath("\$.address.houseNumber").value("12"))
            .andExpect(jsonPath("\$.address.houseNumberAddition").value("A"))
            .andExpect(jsonPath("\$.address.postalCode").value("1234 AB"))
            .andExpect(jsonPath("\$.address.city").value("Hilversum"))
    }

    @Test
    fun `should return the stored address via GET-method and clear it via PUT-method with blank address fields`() {
        val user = createUser()
        val address =
            Address(
                street = "Sesamstraat",
                houseNumber = "12",
                houseNumberAddition = null,
                postalCode = "1234 AB",
                city = "Hilversum",
            )
        val uuid = createPerson(user, aPersonForm().copy(address = address)).get("uuid").textValue()

        mvc
            .perform(get("$baseUrl/$uuid").with(user).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.address.street").value("Sesamstraat"))
            .andExpect(jsonPath("\$.address.houseNumber").value("12"))
            .andExpect(jsonPath("\$.address.houseNumberAddition").isEmpty)
            .andExpect(jsonPath("\$.address.postalCode").value("1234 AB"))
            .andExpect(jsonPath("\$.address.city").value("Hilversum"))

        val blankAddress = Address(street = "", houseNumber = " ", houseNumberAddition = null, postalCode = "", city = "")

        mvc
            .perform(
                put("$baseUrl/$uuid")
                    .with(user)
                    .content(mapper.writeValueAsString(aPersonForm().copy(address = blankAddress)))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.address").isEmpty)

        mvc
            .perform(get("$baseUrl/$uuid").with(user).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.address").isEmpty)
    }

    @Test
    fun `should reject an address with an invalid Dutch postal code via POST-method`() {
        val personForm =
            aPersonForm().copy(
                address =
                    Address(
                        street = "Sesamstraat",
                        houseNumber = "12",
                        houseNumberAddition = null,
                        postalCode = "12345",
                        city = "Hilversum",
                    ),
            )

        mvc
            .perform(
                post(baseUrl)
                    .with(createUser())
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should reject an address with a non-numeric house number via POST-method`() {
        val personForm =
            aPersonForm().copy(
                address =
                    Address(
                        street = "Sesamstraat",
                        houseNumber = "12A",
                        houseNumberAddition = null,
                        postalCode = "1234 AB",
                        city = "Hilversum",
                    ),
            )

        mvc
            .perform(
                post(baseUrl)
                    .with(createUser())
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `should reject an incomplete address via PUT-method`() {
        val user = createUser()
        val uuid = createPerson(user, aPersonForm()).get("uuid").textValue()
        val incompleteAddress = Address(street = "Sesamstraat", houseNumber = "", houseNumberAddition = null, postalCode = "", city = "")

        mvc
            .perform(
                put("$baseUrl/$uuid")
                    .with(user)
                    .content(mapper.writeValueAsString(aPersonForm().copy(address = incompleteAddress)))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)

        mvc
            .perform(get("$baseUrl/$uuid").with(user).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.address").isEmpty)
    }

    // A 1x1 transparent PNG, the smallest valid image LogoService.contentTypeOf recognises
    private val aPngDataUrl =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

    private fun MockHttpServletRequestBuilder.json(body: String) = content(body).contentType(APPLICATION_JSON).accept(APPLICATION_JSON)

    /**
     * A raw JSON body matching the wire contract (persons.ws), used instead of serialising
     * [PersonForm] directly: its `photo` is a [PhotoChange], which has no plain-string shape.
     */
    private fun personJson(
        firstname: String? = "Morris",
        lastname: String? = "Moss",
        photo: String? = null,
    ): String =
        mapper.writeValueAsString(
            mapOf(
                "firstname" to firstname,
                "lastname" to lastname,
                "email" to "",
                "position" to "",
                "number" to null,
                "userCode" to null,
                "active" to true,
                "photo" to photo,
            ),
        )

    @Test
    fun `the photo is kept when left out of a PUT and removed when empty`() {
        val user = createUser()

        val uuid =
            mvc
                .perform(post(baseUrl).with(user).json(personJson(photo = aPngDataUrl)))
                .asyncDispatch()
                .andExpect(status().isOk)
                .andExpect(jsonPath("\$.photo").value(aPngDataUrl))
                .andReturn()
                .response.contentAsString
                .let { mapper.readTree(it)["uuid"].asText() }

        // Leaving photo out of a PUT keeps it
        mvc
            .perform(put("$baseUrl/$uuid").with(user).json(personJson()))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.photo").value(aPngDataUrl))

        // An empty photo removes it
        mvc
            .perform(put("$baseUrl/$uuid").with(user).json(personJson(photo = "")))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.photo").doesNotExist())

        mvc
            .perform(get("$baseUrl/$uuid").with(user).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.photo").doesNotExist())
    }

    /** A login user holding only [authorities], with a person linked to it. */
    private fun createLinkedUser(vararg authorities: String): Pair<RequestPostProcessor, UUID> {
        val account =
            userAccountService.createUserAccountPassword(
                UserAccountPasswordForm(
                    email = UUID.randomUUID().toString(),
                    name = "Linked",
                    authorities = authorities.toSet(),
                    password = "secret",
                ),
            )
        val person =
            personService.create(
                PersonForm(
                    firstname = "Roy",
                    lastname = "Trenneman",
                    email = "roy@it.com",
                    position = "Support",
                    number = "42",
                    userCode = account.user.code,
                    active = true,
                    googleDriveId = "drive",
                ),
            )
        return user(UserSecurityService.UserSecurityPassword(account)) to person.uuid
    }

    /** The form a person sends to change their own details, trying to change admin fields too. */
    private fun ownDetailsJson(photo: String? = null): String =
        mapper.writeValueAsString(
            mapOf(
                "firstname" to "Maurice",
                "lastname" to "Moss",
                "email" to "moss@it.com",
                "birthdate" to "1980-01-02",
                "shoeSize" to "44",
                "shirtSize" to "L",
                "receiveEmail" to false,
                "address" to
                    mapOf(
                        "street" to "Carenza Lane",
                        "houseNumber" to "12",
                        "postalCode" to "1234 AB",
                        "city" to "London",
                    ),
                "photo" to photo,
                // Only an admin may change these, so they are kept as they are
                "position" to "Boss",
                "number" to "1",
                "joinDate" to "2000-01-01",
                "active" to false,
                "userCode" to null,
                "googleDriveId" to "other",
            ),
        )

    @Test
    fun `a person with person read and write rights may edit only their own personal details`() {
        val (user, uuid) = createLinkedUser("PersonAuthority.READ", "PersonAuthority.WRITE")

        mvc
            .perform(get("$baseUrl/$uuid").with(user).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.firstname").value("Roy"))

        mvc
            .perform(put("$baseUrl/$uuid").with(user).json(ownDetailsJson(photo = aPngDataUrl)))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("\$.firstname").value("Maurice"))
            .andExpect(jsonPath("\$.lastname").value("Moss"))
            .andExpect(jsonPath("\$.email").value("moss@it.com"))
            .andExpect(jsonPath("\$.birthdate").value("1980-01-02"))
            .andExpect(jsonPath("\$.shoeSize").value("44"))
            .andExpect(jsonPath("\$.receiveEmail").value(false))
            .andExpect(jsonPath("\$.address.city").value("London"))
            .andExpect(jsonPath("\$.photo").value(aPngDataUrl))
            .andExpect(jsonPath("\$.position").value("Support"))
            .andExpect(jsonPath("\$.number").value("42"))
            .andExpect(jsonPath("\$.joinDate").doesNotExist())
            .andExpect(jsonPath("\$.active").value(true))
            .andExpect(jsonPath("\$.googleDriveId").value("drive"))
            .andExpect(jsonPath("\$.user").exists())
    }

    @Test
    fun `a person with person read and write rights may not edit somebody else`() {
        val (user, _) = createLinkedUser("PersonAuthority.READ", "PersonAuthority.WRITE")
        val (_, other) = createLinkedUser()

        mvc
            .perform(put("$baseUrl/$other").with(user).json(ownDetailsJson()))
            .asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `a person without both person read and write rights may not read or edit their own details`() {
        listOf(arrayOf("CvAuthority.READ", "CvAuthority.WRITE"), arrayOf("PersonAuthority.READ"), arrayOf("PersonAuthority.WRITE"))
            .forEach { authorities ->
                val (user, uuid) = createLinkedUser(*authorities)

                mvc
                    .perform(put("$baseUrl/$uuid").with(user).json(ownDetailsJson()))
                    .asyncDispatch()
                    .andExpect(status().isForbidden)

                if ("PersonAuthority.READ" !in authorities) {
                    mvc
                        .perform(get("$baseUrl/$uuid").with(user).accept(APPLICATION_JSON))
                        .asyncDispatch()
                        .andExpect(status().isForbidden)
                }
            }
    }

    @Test
    fun `a photo over 512 KB is rejected`() {
        val user = createUser()
        val tooBig = "data:image/png;base64," + "A".repeat(700_000)

        mvc
            .perform(post(baseUrl).with(user).json(personJson(photo = tooBig)))
            .asyncDispatch()
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `a photo that is not a real image is rejected`() {
        val user = createUser()

        mvc
            .perform(post(baseUrl).with(user).json(personJson(photo = "data:image/png;base64,not-valid-base64!!")))
            .asyncDispatch()
            .andExpect(status().isBadRequest)

        val notAnImage = "data:text/plain;base64,${java.util.Base64.getEncoder().encodeToString("not an image".toByteArray())}"
        mvc
            .perform(post(baseUrl).with(user).json(personJson(photo = notAnImage)))
            .asyncDispatch()
            .andExpect(status().isBadRequest)
    }

    private fun aPersonForm() =
        PersonForm(
            firstname = "Morris",
            lastname = "Moss",
            email = "",
            position = "",
            number = null,
            userCode = null,
            active = true,
        )

    private fun createPerson(
        user: RequestPostProcessor,
        personForm: PersonForm,
    ): JsonNode =
        mvc
            .perform(
                post(baseUrl)
                    .with(user)
                    .content(mapper.writeValueAsString(personForm))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andReturn()
            .response
            .contentAsString
            .let(mapper::readTree)

    @Test
    fun `should return an error while trying to get a non-existing person via GET-request`() {
        val user = createUser()
        // DRY-Bock
        mvc
            .perform(
                get("$baseUrl/3b7ab8e2-aeeb-4228-98d8-bd22fa141caa")
                    .with(user)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isNotFound)
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
            ).asyncDispatch()
            .andExpect(status().isOk())
            .andExpect(
                jsonPath(
                    "$.*.active",
                    Matchers.everyItem(Matchers.`is`(true)),
                ),
            )
    }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
