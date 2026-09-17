package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.LaptopAuthority
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toDomain
import org.junit.jupiter.api.Test
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.time.LocalDate
import java.util.UUID

class LaptopControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/laptops"

    private val adminAuthorities = setOf(LaptopAuthority.READ, LaptopAuthority.WRITE, LaptopAuthority.ADMIN)
    private val writeAuthorities = setOf(LaptopAuthority.READ, LaptopAuthority.WRITE)

    private fun laptopJson(
        name: String? = "MacBook Pro 16",
        serialNumber: String? = "C02XK1ABCD01",
        contractSigned: Boolean? = false,
        purchaseDate: String? = null,
        personId: String? = null,
    ): String =
        mapper.writeValueAsString(
            mapOf(
                "name" to name,
                "serialNumber" to serialNumber,
                "contractSigned" to contractSigned,
                "purchaseDate" to purchaseDate,
                "personId" to personId,
            ),
        )

    @Test
    fun `admin registers a laptop for a person via POST`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity("Tommy", "Dog")

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(contractSigned = true, purchaseDate = "2024-05-03", personId = person.uuid.toString()))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.code").exists())
            .andExpect(jsonPath("$.name").value("MacBook Pro 16"))
            .andExpect(jsonPath("$.serialNumber").value("C02XK1ABCD01"))
            .andExpect(jsonPath("$.contractSigned").value(true))
            .andExpect(jsonPath("$.purchaseDate").value("2024-05-03"))
            .andExpect(jsonPath("$.person.uuid").value(person.uuid.toString()))
            .andExpect(jsonPath("$.person.fullName").value("Tommy Dog"))
    }

    @Test
    fun `a laptop does not need a person and defaults to an unsigned contract`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(mapper.writeValueAsString(mapOf("name" to " Spare laptop ", "serialNumber" to " SPARE-01 ")))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Spare laptop"))
            .andExpect(jsonPath("$.serialNumber").value("SPARE-01"))
            .andExpect(jsonPath("$.contractSigned").value(false))
            .andExpect(jsonPath("$.purchaseDate").doesNotExist())
            .andExpect(jsonPath("$.person").doesNotExist())
    }

    @Test
    fun `POST with a purchase date that is not a date is a 400`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(purchaseDate = "03-05-2024"))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("purchaseDate must be a date formatted as yyyy-MM-dd"))
    }

    @Test
    fun `POST without a name or serial number is a 400`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(name = "  "))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("name is required"))

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(serialNumber = null))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("serialNumber is required"))
    }

    @Test
    fun `POST with an unknown or malformed person is a 400`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val unknownPerson = UUID.randomUUID()

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(personId = unknownPerson.toString()))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("Person $unknownPerson not found"))

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(personId = "not-a-uuid"))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("personId must be a UUID"))
    }

    @Test
    fun `a serial number can only be registered once, regardless of case and whitespace`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        createHelper.createLaptop(serialNumber = "C02XK1ABCD01")

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(name = "Another laptop", serialNumber = " c02xk1abcd01 "))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.message").value("A laptop with serial number 'c02xk1abcd01' is already registered"))
    }

    @Test
    fun `GET by code returns the laptop and 404 for an unknown code`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity("Pino", "Woodpecker")
        val laptop = createHelper.createLaptop(name = "ThinkPad X1", serialNumber = "PF3ABCD03", person = person)

        mvc
            .perform(
                get("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(laptop.code))
            .andExpect(jsonPath("$.name").value("ThinkPad X1"))
            .andExpect(jsonPath("$.serialNumber").value("PF3ABCD03"))
            .andExpect(jsonPath("$.person.uuid").value(person.uuid.toString()))

        mvc
            .perform(
                get("$baseUrl/does-not-exist")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.message").value("Laptop not found"))
    }

    @Test
    fun `GET all lists laptops sorted by name with the total in the x-total header`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        createHelper.createLaptop(name = "Zed laptop")
        createHelper.createLaptop(name = "Alpha laptop")
        createHelper.createLaptop(name = "Mid laptop")

        mvc
            .perform(
                get("$baseUrl?page=0&size=2&sort=name,asc")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(header().string("x-total", "3"))
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].name").value("Alpha laptop"))
            .andExpect(jsonPath("$[1].name").value("Mid laptop"))
    }

    @Test
    fun `GET all can be filtered on the person that has the laptop`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val tommy = createHelper.createPersonEntity("Tommy", "Dog")
        val pino = createHelper.createPersonEntity("Pino", "Woodpecker")
        val tommysLaptop = createHelper.createLaptop(person = tommy)
        createHelper.createLaptop(person = pino)
        createHelper.createLaptop()

        mvc
            .perform(
                get("$baseUrl?personId=${tommy.uuid}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(header().string("x-total", "1"))
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].code").value(tommysLaptop.code))

        mvc
            .perform(
                get("$baseUrl?personId=not-a-uuid")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT updates the laptop, can hand it to another person and sign the contract`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val tommy = createHelper.createPersonEntity("Tommy", "Dog")
        val pino = createHelper.createPersonEntity("Pino", "Woodpecker")
        val laptop =
            createHelper.createLaptop(
                name = "MacBook Air",
                serialNumber = "AIR-01",
                purchaseDate = LocalDate.of(2023, 1, 1),
                person = tommy,
            )

        mvc
            .perform(
                put("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(
                        laptopJson(
                            name = "MacBook Air 13",
                            // Keeping its own serial number (in another case) is not a conflict
                            serialNumber = "air-01",
                            contractSigned = true,
                            purchaseDate = "2024-05-03",
                            personId = pino.uuid.toString(),
                        ),
                    ).contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(laptop.code))
            .andExpect(jsonPath("$.name").value("MacBook Air 13"))
            .andExpect(jsonPath("$.serialNumber").value("air-01"))
            .andExpect(jsonPath("$.contractSigned").value(true))
            .andExpect(jsonPath("$.purchaseDate").value("2024-05-03"))
            .andExpect(jsonPath("$.person.uuid").value(pino.uuid.toString()))
    }

    @Test
    fun `PUT without a person takes the laptop back in`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val tommy = createHelper.createPersonEntity("Tommy", "Dog")
        val laptop =
            createHelper.createLaptop(
                serialNumber = "AIR-02",
                contractSigned = true,
                purchaseDate = LocalDate.of(2023, 1, 1),
                person = tommy,
            )

        mvc
            .perform(
                put("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(name = laptop.name, serialNumber = "AIR-02", contractSigned = false, personId = null))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contractSigned").value(false))
            .andExpect(jsonPath("$.purchaseDate").doesNotExist())
            .andExpect(jsonPath("$.person").doesNotExist())
    }

    @Test
    fun `PUT rejects a serial number of another laptop and an unknown code`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        createHelper.createLaptop(serialNumber = "TAKEN-01")
        val laptop = createHelper.createLaptop(serialNumber = "MINE-01")

        mvc
            .perform(
                put("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(serialNumber = "TAKEN-01"))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isConflict)

        mvc
            .perform(
                put("$baseUrl/does-not-exist")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .content(laptopJson(serialNumber = "NEW-01"))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.message").value("Laptop not found"))
    }

    @Test
    fun `admin deletes a laptop via DELETE`() {
        val adminUser = createHelper.createUserEntity(adminAuthorities)
        val laptop = createHelper.createLaptop()

        mvc
            .perform(
                delete("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isNoContent)

        mvc
            .perform(
                get("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(adminUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `WRITE authority may register but not delete a laptop`() {
        val writeUser = createHelper.createUserEntity(writeAuthorities)
        val laptop = createHelper.createLaptop()

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(writeUser.toDomain())))
                    .content(laptopJson(serialNumber = "WRITE-01"))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)

        mvc
            .perform(
                delete("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(writeUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `READ authority may list but not register a laptop`() {
        val readUser = createHelper.createUserEntity(setOf(LaptopAuthority.READ))
        createHelper.createLaptop()

        mvc
            .perform(
                get(baseUrl)
                    .with(user(CreateHelper.UserSecurity(readUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))

        mvc
            .perform(
                post(baseUrl)
                    .with(user(CreateHelper.UserSecurity(readUser.toDomain())))
                    .content(laptopJson(serialNumber = "READ-01"))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `without LaptopAuthority the endpoints are forbidden`() {
        val unauthorizedUser = createHelper.createUserEntity(emptySet())
        val laptop = createHelper.createLaptop()

        mvc
            .perform(
                get("$baseUrl/${laptop.code}")
                    .with(user(CreateHelper.UserSecurity(unauthorizedUser.toDomain())))
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isForbidden)
    }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
