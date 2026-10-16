package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.CvAuthority
import community.flock.eco.workday.application.authorities.PersonAuthority
import community.flock.eco.workday.application.model.CvLanguage
import community.flock.eco.workday.application.repository.CvRepository
import community.flock.eco.workday.application.services.LogoService
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toDomain
import org.assertj.core.api.Assertions.assertThat
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
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import java.util.UUID
import community.flock.eco.workday.user.model.User as UserEntity

class CvControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
    @Autowired private val logoService: LogoService,
    @Autowired private val cvRepository: CvRepository,
) : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/cvs"

    // ADMIN on its own reads and writes every CV
    private val adminAuthorities = setOf(CvAuthority.ADMIN)
    private val workerAuthorities = setOf(CvAuthority.READ, CvAuthority.WRITE)

    private val ingExperience =
        mapOf(
            "from" to "2024-08",
            "to" to null,
            "role" to " Software Engineer ",
            "client" to "ING",
            "employer" to "Flock",
            "technologies" to listOf("Kotlin", " React ", "", "Kotlin", "HTML, CSS"),
            "description" to "Rebuilt the business portal.\n\nhttps://www.flock.community/cases/ing-front-end-team",
        )

    private fun cvJson(
        name: String? = "Algemeen",
        language: String? = "NL",
        personId: String? = null,
        basedOn: String? = null,
        place: String? = "Hilversum",
        summary: String? = "Engineer at heart.",
        experiences: List<Map<String, Any?>> = listOf(ingExperience),
        skills: List<Map<String, Any?>> =
            listOf(
                mapOf("category" to "Programming", "name" to "Kotlin", "level" to 5),
                mapOf("category" to " ", "name" to " Git ", "level" to null),
            ),
    ): String =
        mapper.writeValueAsString(
            mapOf(
                "personId" to personId,
                "name" to name,
                "language" to language,
                "place" to place,
                "phone" to null,
                "summary" to summary,
                "experiences" to experiences,
                "skills" to skills,
                "education" to "Master, Business Information Management, Rotterdam (2012)",
                "subjects" to null,
                "languages" to "Dutch – Native\nEnglish – Excellent",
                "basedOn" to basedOn,
            ),
        )

    /** A worker with a person of their own, the way everybody at Flock is set up. */
    private fun aWorker(
        firstname: String = "Tommy",
        lastname: String = "Dog",
    ): Pair<UserEntity, community.flock.eco.workday.application.model.Person> {
        val user = createHelper.createUserEntity(workerAuthorities)
        return user to createHelper.createPersonEntity(firstname, lastname, user.code)
    }

    private fun postCv(
        user: UserEntity,
        body: String,
    ): Map<String, Any?> = mvc.perform(post(baseUrl).asUser(user).json(body)).asyncDispatch().toMap()

    private fun getCv(
        user: UserEntity,
        code: String,
    ): Map<String, Any?> = mvc.perform(get("$baseUrl/$code").asUser(user).accept(APPLICATION_JSON)).asyncDispatch().toMap()

    @Suppress("UNCHECKED_CAST")
    private fun experiencesOf(cv: Map<String, Any?>) = cv["experiences"] as List<Map<String, Any?>>

    @Suppress("UNCHECKED_CAST")
    private fun skillsOf(cv: Map<String, Any?>) = cv["skills"] as List<Map<String, Any?>>

    @Suppress("UNCHECKED_CAST")
    private fun ResultActions.toMap(): Map<String, Any?> =
        mapper.readValue(andExpect(status().isOk).andReturn().response.contentAsString, Map::class.java) as Map<String, Any?>

    private fun MockHttpServletRequestBuilder.asUser(user: UserEntity) = with(user(CreateHelper.UserSecurity(user.toDomain())))

    private fun MockHttpServletRequestBuilder.json(body: String) = content(body).contentType(APPLICATION_JSON).accept(APPLICATION_JSON)

    @Test
    fun `a worker writes their own CV, newest experience first with the technologies trimmed`() {
        val (worker, person) = aWorker()
        val older = ingExperience + mapOf("from" to "2020-06", "to" to "2022-11", "client" to "DHL", "description" to null)

        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(experiences = listOf(older, ingExperience))))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(content().contentType(APPLICATION_JSON))
            .andExpect(jsonPath("$.code").exists())
            .andExpect(jsonPath("$.language").value("NL"))
            .andExpect(jsonPath("$.place").value("Hilversum"))
            .andExpect(jsonPath("$.updatedAt").exists())
            .andExpect(jsonPath("$.person.uuid").value(person.uuid.toString()))
            .andExpect(jsonPath("$.person.fullName").value("Tommy Dog"))
            .andExpect(jsonPath("$.experiences.length()").value(2))
            .andExpect(jsonPath("$.experiences[0].from").value("2024-08"))
            .andExpect(jsonPath("$.experiences[0].to").doesNotExist())
            .andExpect(jsonPath("$.experiences[0].role").value("Software Engineer"))
            .andExpect(jsonPath("$.experiences[0].technologies.length()").value(3))
            .andExpect(jsonPath("$.experiences[0].technologies[0]").value("Kotlin"))
            .andExpect(jsonPath("$.experiences[0].technologies[1]").value("React"))
            .andExpect(jsonPath("$.experiences[0].technologies[2]").value("HTML, CSS"))
            .andExpect(jsonPath("$.experiences[1].client").value("DHL"))
            .andExpect(jsonPath("$.experiences[1].to").value("2022-11"))
            .andExpect(jsonPath("$.skills.length()").value(2))
            .andExpect(jsonPath("$.skills[0].category").value("Programming"))
            .andExpect(jsonPath("$.skills[0].name").value("Kotlin"))
            .andExpect(jsonPath("$.skills[0].level").value(5))
            .andExpect(jsonPath("$.skills[1].category").doesNotExist())
            .andExpect(jsonPath("$.skills[1].name").value("Git"))
            .andExpect(jsonPath("$.skills[1].level").doesNotExist())
            .andExpect(jsonPath("$.education").value("Master, Business Information Management, Rotterdam (2012)"))
            .andExpect(jsonPath("$.subjects").doesNotExist())
            .andExpect(jsonPath("$.languages").value("Dutch – Native\nEnglish – Excellent"))
    }

    @Test
    fun `a worker cannot write the CV of somebody else, the person in the form is ignored`() {
        val (worker, me) = aWorker()
        val someoneElse = createHelper.createPersonEntity("Pino", "Woodpecker")

        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(personId = someoneElse.uuid.toString())))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.person.uuid").value(me.uuid.toString()))
    }

    @Test
    fun `an admin writes the CV of any person`() {
        val admin = createHelper.createUserEntity(adminAuthorities)
        val person = createHelper.createPersonEntity("Pino", "Woodpecker")

        mvc
            .perform(post(baseUrl).asUser(admin).json(cvJson(language = "EN", personId = person.uuid.toString())))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.language").value("EN"))
            .andExpect(jsonPath("$.person.fullName").value("Pino Woodpecker"))
    }

    @Test
    fun `a person can have several versions of a CV, each with its own name`() {
        val (worker, person) = aWorker()
        createHelper.createCv(person, CvLanguage.NL, name = "Algemeen 2025")

        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(name = " algemeen 2025 ")))
            .asyncDispatch()
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.message").value("Tommy Dog already has a CV named 'algemeen 2025'"))

        // Another Dutch one is fine, as long as it has a name of its own
        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(name = " Frontend ", language = "NL")))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value("Frontend"))

        mvc
            .perform(get(baseUrl).asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(header().string("x-total", "2"))
    }

    @Test
    fun `the first CV in a language is the base, the next ones are copies of it`() {
        val (worker) = aWorker()

        val base = postCv(worker, cvJson(name = "Algemeen"))
        assertThat(base["base"]).isEqualTo(true)
        assertThat(base["basedOn"]).isNull()

        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(name = "Frontend")))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.base").value(false))
            .andExpect(jsonPath("$.basedOn").value(base["code"]))
            // Not copied from the base, so there is no version of it to compare with
            .andExpect(jsonPath("$.basedOnUpdatedAt").doesNotExist())

        // English has a base of its own
        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(name = "General", language = "EN")))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.base").value(true))
            .andExpect(jsonPath("$.basedOn").doesNotExist())
    }

    @Test
    fun `a copy is always made of the base, in its language`() {
        val (worker, person) = aWorker()
        val base = createHelper.createCv(person, name = "Algemeen")
        val copy = createHelper.createCv(person, name = "ING")
        val someoneElses = createHelper.createCv(createHelper.createPersonEntity("Pino", "Woodpecker"))

        // The copy remembers which version of the base it was made of
        val baseSavedAt = getCv(worker, base.code)["updatedAt"]
        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(name = "Rabobank", basedOn = base.code)))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.base").value(false))
            .andExpect(jsonPath("$.basedOn").value(base.code))
            .andExpect(jsonPath("$.basedOnUpdatedAt").value(baseSavedAt))

        listOf(
            cvJson(name = "Copy of a copy", basedOn = copy.code) to "basedOn is not a base CV; a copy is always made of the base",
            cvJson(name = "English", language = "EN", basedOn = base.code) to "A copy of a base CV is in its language (NL)",
            cvJson(name = "Somebody else", basedOn = someoneElses.code) to "basedOn is not a CV of Tommy Dog",
        ).forEach { (body, message) ->
            mvc
                .perform(post(baseUrl).asUser(worker).json(body))
                .asyncDispatch()
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.message").value(message))
        }
    }

    @Test
    fun `a base with copies is not deleted and keeps its language, a copy keeps the language of its base`() {
        val (worker, person) = aWorker()
        val base = createHelper.createCv(person, name = "Algemeen")
        val copy = createHelper.createCv(person, name = "ING")
        val baseHasCopies = "'Algemeen' is the base of other CVs; make one of those the base before"

        mvc
            .perform(delete("$baseUrl/${base.code}").asUser(worker))
            .asyncDispatch()
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.message").value("$baseHasCopies deleting it"))
        mvc
            .perform(put("$baseUrl/${base.code}").asUser(worker).json(cvJson(name = "Algemeen", language = "EN")))
            .asyncDispatch()
            .andExpect(status().isConflict)
            .andExpect(jsonPath("$.message").value("$baseHasCopies changing its language"))
        mvc
            .perform(put("$baseUrl/${copy.code}").asUser(worker).json(cvJson(name = "ING", language = "EN")))
            .asyncDispatch()
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("A copy of a base CV is in its language (NL)"))

        // Saving a copy keeps it a copy of the same base
        mvc
            .perform(put("$baseUrl/${copy.code}").asUser(worker).json(cvJson(name = "ING", summary = "Tailored.")))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.basedOn").value(base.code))

        // Without copies a base can be deleted
        listOf(copy, base).forEach {
            mvc
                .perform(delete("$baseUrl/${it.code}").asUser(worker))
                .asyncDispatch()
                .andExpect(status().isNoContent)
        }
    }

    @Test
    fun `a base on its own may change language, and becomes a copy where there is a base already`() {
        val (worker, person) = aWorker()
        val english = createHelper.createCv(person, CvLanguage.EN, name = "General")
        val dutch = createHelper.createCv(person, CvLanguage.NL, name = "Algemeen")

        mvc
            .perform(put("$baseUrl/${dutch.code}").asUser(worker).json(cvJson(name = "Algemeen", language = "EN")))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.base").value(false))
            .andExpect(jsonPath("$.basedOn").value(english.code))
    }

    @Test
    fun `whoever may write the CVs makes another one the base, the others become copies of it`() {
        val admin = createHelper.createUserEntity(adminAuthorities)
        val (worker, person) = aWorker()
        val (someoneElse) = aWorker("Pino", "Woodpecker")
        val oldBase = createHelper.createCv(person, name = "Algemeen")
        val ing = createHelper.createCv(person, name = "ING")
        val newBase = createHelper.createCv(person, name = "Algemeen 2026")
        val english = createHelper.createCv(person, CvLanguage.EN, name = "General")

        mvc
            .perform(post("$baseUrl/${newBase.code}/base").asUser(someoneElse).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)

        mvc
            .perform(post("$baseUrl/${newBase.code}/base").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.base").value(true))
            .andExpect(jsonPath("$.basedOn").doesNotExist())

        listOf(oldBase, ing).forEach {
            mvc
                .perform(get("$baseUrl/${it.code}").asUser(admin).accept(APPLICATION_JSON))
                .asyncDispatch()
                .andExpect(jsonPath("$.base").value(false))
                .andExpect(jsonPath("$.basedOn").value(newBase.code))
                .andExpect(jsonPath("$.basedOnUpdatedAt").doesNotExist())
        }
        // Another language has a base of its own
        mvc
            .perform(get("$baseUrl/${english.code}").asUser(admin).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.base").value(true))

        mvc
            .perform(post("$baseUrl/${UUID.randomUUID()}/base").asUser(admin).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `assignments and skills keep their id when saved, and a copy shares them with its base`() {
        val (worker) = aWorker()
        val base = postCv(worker, cvJson(name = "Algemeen"))
        val ingId = experiencesOf(base).single()["id"]
        val kotlinId = skillsOf(base).first()["id"]

        // Saved again without ids, from a client that does not know them
        mvc
            .perform(put("$baseUrl/${base["code"]}").asUser(worker).json(cvJson(name = "Algemeen", summary = "Saved again.")))
            .asyncDispatch()
            .andExpect(jsonPath("$.experiences[0].id").value(ingId))
            .andExpect(jsonPath("$.skills[0].id").value(kotlinId))

        val copy = postCv(worker, cvJson(name = "ING", basedOn = base["code"] as String))
        assertThat(experiencesOf(copy).single()["id"]).isEqualTo(ingId)
        assertThat(skillsOf(copy).first()["id"]).isEqualTo(kotlinId)
    }

    @Test
    fun `saving the base brings its copies along, facts at once and texts on offer`() {
        val (worker) = aWorker()
        val base = postCv(worker, cvJson(name = "Algemeen"))
        val code = base["code"] as String
        val copy = postCv(worker, cvJson(name = "ING", basedOn = code))
        val tailored = postCv(worker, cvJson(name = "Rabobank", basedOn = code, place = "Amsterdam"))
        val ingId = experiencesOf(base).single()["id"] as String

        val rabo = mapOf("from" to "2025-09", "to" to null, "role" to "Architect", "client" to "Rabobank", "technologies" to listOf("Kotlin"))
        val changedIng = ingExperience + mapOf("id" to ingId, "role" to "Lead Engineer", "description" to "Led the team.")
        mvc
            .perform(
                put("$baseUrl/$code")
                    .asUser(worker)
                    .json(cvJson(name = "Algemeen", place = "Utrecht", summary = "Engineer and coach.", experiences = listOf(rabo, changedIng))),
            ).asyncDispatch()
            .andExpect(status().isOk)

        getCv(worker, copy["code"] as String).let { it ->
            assertThat(it["place"]).isEqualTo("Utrecht")
            assertThat(it["summary"]).isEqualTo("Engineer at heart.")
            assertThat(experiencesOf(it).map { e -> e["client"] }).containsExactly("Rabobank", "ING")
            assertThat(experiencesOf(it).last()["role"]).isEqualTo("Lead Engineer")
            assertThat(experiencesOf(it).last()["description"]).isEqualTo(ingExperience["description"])
        }
        mvc
            .perform(get("$baseUrl/${copy["code"]}/sync").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.base").value(code))
            .andExpect(jsonPath("$.offers.length()").value(2))
            .andExpect(jsonPath("$.offers[0].address").value("summary"))
            .andExpect(jsonPath("$.offers[0].base").value("Engineer and coach."))
            .andExpect(jsonPath("$.offers[1].address").value("experience/$ingId/description"))
            .andExpect(jsonPath("$.tailored.length()").value(0))

        // The copy that tailored its place keeps it, and is offered the base's
        assertThat(getCv(worker, tailored["code"] as String)["place"]).isEqualTo("Amsterdam")
        mvc
            .perform(get("$baseUrl/${tailored["code"]}/sync").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.offers[0].address").value("place"))
            .andExpect(jsonPath("$.offers[0].outdated").value(true))

        // A copy has a history of what the base brought along
        mvc
            .perform(get("$baseUrl/${copy["code"]}/revisions").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.length()").value(1))
    }

    @Test
    fun `a copy takes the base's text, keeps its own, or puts its own in the base`() {
        val (worker) = aWorker()
        val base = postCv(worker, cvJson(name = "Algemeen"))
        val code = base["code"] as String
        val copy = postCv(worker, cvJson(name = "ING", basedOn = code, summary = "Tailored for ING."))
        val other = postCv(worker, cvJson(name = "Rabobank", basedOn = code))
        val copyCode = copy["code"] as String
        val sync = { address: String, action: String ->
            mvc.perform(
                post("$baseUrl/$copyCode/sync").asUser(worker).json(mapper.writeValueAsString(mapOf("address" to address, "action" to action))),
            ).asyncDispatch()
        }

        mvc
            .perform(get("$baseUrl/$copyCode/sync").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.offers.length()").value(0))
            .andExpect(jsonPath("$.tailored[0].address").value("summary"))
            .andExpect(jsonPath("$.tailored[0].copy").value("Tailored for ING."))

        // Into the base: the base has it, and the other copy is offered it
        sync("summary", "PROMOTE").andExpect(status().isOk).andExpect(jsonPath("$.summary").value("Tailored for ING."))
        assertThat(getCv(worker, code)["summary"]).isEqualTo("Tailored for ING.")
        mvc
            .perform(get("$baseUrl/$copyCode/sync").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.offers.length()").value(0))
            .andExpect(jsonPath("$.tailored.length()").value(0))
        mvc
            .perform(get("$baseUrl/${other["code"]}/sync").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.offers[0].address").value("summary"))

        // Back to the base's version of a tailored field
        mvc
            .perform(put("$baseUrl/$copyCode").asUser(worker).json(cvJson(name = "ING", place = "Delft", summary = "Tailored for ING.")))
            .asyncDispatch()
            .andExpect(status().isOk)
        sync("place", "ACCEPT").andExpect(status().isOk).andExpect(jsonPath("$.place").value("Hilversum"))

        sync("name", "ACCEPT").andExpect(status().isBadRequest).andExpect(jsonPath("$.message").value("Unknown field name"))
        mvc
            .perform(get("$baseUrl/$code/sync").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `a CV made the base lends its ids to the others, so what they share follows it`() {
        val admin = createHelper.createUserEntity(adminAuthorities)
        val (_, person) = aWorker()
        createHelper.createCv(person, name = "Algemeen")
        val newBase = createHelper.createCv(person, name = "Algemeen 2026")

        mvc
            .perform(post("$baseUrl/${newBase.code}/base").asUser(admin).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)

        val old = cvRepository.findByPersonUuidAndNameIgnoreCase(person.uuid, "Algemeen")!!
        assertThat(old.experiences.single().itemId).isEqualTo(newBase.experiences.single().itemId)
        mvc
            .perform(get("$baseUrl/${old.code}/sync").asUser(admin).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.offers.length()").value(0))
            .andExpect(jsonPath("$.tailored.length()").value(0))
    }

    @Test
    fun `every save keeps the version before it, which can be read and restored`() {
        val (worker, person) = aWorker()
        val cv = createHelper.createCv(person, name = "Algemeen", summary = "First version.")

        listOf("Second version.", "Third version.", "Third version.").forEach { summary ->
            mvc
                .perform(put("$baseUrl/${cv.code}").asUser(worker).json(cvJson(summary = summary)))
                .asyncDispatch()
                .andExpect(status().isOk)
        }

        // Saving without changes adds no version: the first and the second remain
        val revisions =
            mvc
                .perform(get("$baseUrl/${cv.code}/revisions").asUser(worker).accept(APPLICATION_JSON))
                .asyncDispatch()
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.length()").value(2))
                .andReturn()
                .response.contentAsString
                .let { mapper.readTree(it) }
        val first = revisions[1]["id"].asText()

        mvc
            .perform(get("$baseUrl/${cv.code}/revisions/$first").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(cv.code))
            .andExpect(jsonPath("$.name").value("Algemeen"))
            .andExpect(jsonPath("$.summary").value("First version."))
            .andExpect(jsonPath("$.updatedAt").value(revisions[1]["savedAt"].asText()))

        mvc
            .perform(post("$baseUrl/${cv.code}/revisions/$first/restore").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.summary").value("First version."))

        // Restoring kept the third version too
        mvc
            .perform(get("$baseUrl/${cv.code}/revisions").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(jsonPath("$.length()").value(3))

        // Somebody else does not see the versions
        val (other) = aWorker("Pino", "Woodpecker")
        mvc
            .perform(get("$baseUrl/${cv.code}/revisions").asUser(other).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
        mvc
            .perform(post("$baseUrl/${cv.code}/revisions/$first/restore").asUser(other).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `an earlier version still opens after a logo on it was deleted`() {
        val (worker) = aWorker()
        val logo = logoService.create("NS ${UUID.randomUUID()}", byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte(), 0))
        val withLogo = listOf(ingExperience + ("logoId" to logo.id.toString()))
        val code =
            mvc
                .perform(post(baseUrl).asUser(worker).json(cvJson(experiences = withLogo)))
                .asyncDispatch()
                .andExpect(status().isOk)
                .andReturn()
                .response.contentAsString
                .let { mapper.readTree(it)["code"].asText() }
        mvc
            .perform(put("$baseUrl/$code").asUser(worker).json(cvJson(summary = "Edited.", experiences = withLogo)))
            .asyncDispatch()
            .andExpect(status().isOk)
        logoService.delete(logo.id)

        val revision =
            mvc
                .perform(get("$baseUrl/$code/revisions").asUser(worker).accept(APPLICATION_JSON))
                .asyncDispatch()
                .andExpect(jsonPath("$.length()").value(1))
                .andReturn()
                .response.contentAsString
                .let { mapper.readTree(it)[0]["id"].asText() }
        mvc
            .perform(get("$baseUrl/$code/revisions/$revision").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.summary").value("Engineer at heart."))
            .andExpect(jsonPath("$.experiences[0].client").value("ING"))
    }

    @Test
    fun `an assignment shows a logo from the shared collection`() {
        val (worker) = aWorker()
        val logo = logoService.create("ING ${UUID.randomUUID()}", byteArrayOf(0xFF.toByte(), 0xD8.toByte(), 0xFF.toByte(), 0))

        mvc
            .perform(post(baseUrl).asUser(worker).json(cvJson(experiences = listOf(ingExperience + ("logoId" to logo.id.toString())))))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.experiences[0].logoId").value(logo.id.toString()))
    }

    @Test
    fun `READ only reads your own CV and WRITE only writes it`() {
        val reader = createHelper.createUserEntity(setOf(CvAuthority.READ))
        val readersCv = createHelper.createCv(createHelper.createPersonEntity("Ernie", "Muppets", reader.code))
        val writer = createHelper.createUserEntity(setOf(CvAuthority.WRITE))
        val writersCv = createHelper.createCv(createHelper.createPersonEntity("Bert", "Muppets", writer.code))

        mvc
            .perform(get("$baseUrl/${readersCv.code}").asUser(reader).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
        mvc
            .perform(put("$baseUrl/${readersCv.code}").asUser(reader).json(cvJson()))
            .asyncDispatch()
            .andExpect(status().isForbidden)
        mvc
            .perform(get("$baseUrl/${writersCv.code}").asUser(reader).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)

        mvc
            .perform(put("$baseUrl/${writersCv.code}").asUser(writer).json(cvJson(summary = "Written.")))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.summary").value("Written."))
        mvc
            .perform(get("$baseUrl/${writersCv.code}").asUser(writer).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isForbidden)
        mvc
            .perform(put("$baseUrl/${readersCv.code}").asUser(writer).json(cvJson()))
            .asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `input that breaks the contract is a 400 naming the field`() {
        val (worker) = aWorker()

        listOf(
            cvJson(experiences = listOf(ingExperience + ("role" to "  "))) to "experiences[0].role is required",
            cvJson(experiences = listOf(ingExperience + ("from" to "08-2024"))) to "experiences[0].from is invalid",
            cvJson(experiences = listOf(ingExperience + mapOf("from" to "2024-08", "to" to "2024-07"))) to
                "experiences[0].to may not be before experiences[0].from",
            cvJson(experiences = listOf(ingExperience + ("technologies" to listOf("Kotlin", "x".repeat(101))))) to
                "experiences[0].technologies[1] may be at most 100 characters",
            cvJson(place = "x".repeat(256)) to "place may be at most 255 characters",
            cvJson(summary = "x".repeat(10001)) to "summary may be at most 10000 characters",
            cvJson(language = "DE") to "language is invalid",
            cvJson(experiences = listOf(ingExperience + ("logoId" to UUID.randomUUID().toString()))) to
                "experiences[0].logoId is not a known logo",
            cvJson(name = " ") to "name is required",
            cvJson(name = "x".repeat(101)) to "name is invalid",
            cvJson(skills = listOf(mapOf("name" to "Kotlin", "level" to 6))) to "skills[0].level must be between 1 and 5",
            cvJson(skills = listOf(mapOf("name" to "", "level" to 3))) to "skills[0].name is required",
        ).forEach { (body, message) ->
            mvc
                .perform(post(baseUrl).asUser(worker).json(body))
                .asyncDispatch()
                .andExpect(status().isBadRequest)
                .andExpect(jsonPath("$.message").value(message))
        }
    }

    @Test
    fun `a worker without a person cannot write a CV`() {
        val userWithoutPerson = createHelper.createUserEntity(workerAuthorities)

        mvc
            .perform(post(baseUrl).asUser(userWithoutPerson).json(cvJson()))
            .asyncDispatch()
            .andExpect(status().isForbidden)
    }

    @Test
    fun `a worker sees only their own CVs, an admin sees all of them and can filter on person`() {
        val (worker, me) = aWorker()
        val someoneElse = createHelper.createPersonEntity("Pino", "Woodpecker")
        val mine = createHelper.createCv(me)
        val theirs = createHelper.createCv(someoneElse)
        val admin = createHelper.createUserEntity(adminAuthorities)

        mvc
            .perform(get(baseUrl).asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(header().string("x-total", "1"))
            .andExpect(jsonPath("$[0].code").value(mine.code))

        mvc
            .perform(get("$baseUrl?personId=${someoneElse.uuid}").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].code").value(mine.code))

        mvc
            .perform(get("$baseUrl?personId=${someoneElse.uuid}").asUser(admin).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(header().string("x-total", "1"))
            .andExpect(jsonPath("$[0].code").value(theirs.code))
    }

    @Test
    fun `a CV of somebody else is not found for a worker`() {
        val (worker, me) = aWorker()
        val mine = createHelper.createCv(me)
        val theirs = createHelper.createCv(createHelper.createPersonEntity("Pino", "Woodpecker"))

        mvc
            .perform(get("$baseUrl/${mine.code}").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.summary").value("Engineer at heart."))
            .andExpect(jsonPath("$.experiences[0].employer").value("Flock"))

        mvc
            .perform(get("$baseUrl/${theirs.code}").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.message").value("CV not found"))

        mvc
            .perform(put("$baseUrl/${theirs.code}").asUser(worker).json(cvJson()))
            .asyncDispatch()
            .andExpect(status().isNotFound)

        mvc
            .perform(delete("$baseUrl/${theirs.code}").asUser(worker))
            .asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `PUT replaces the CV and DELETE removes it`() {
        val (worker, me) = aWorker()
        val cv = createHelper.createCv(me)

        mvc
            .perform(
                put("$baseUrl/${cv.code}")
                    .asUser(worker)
                    .json(cvJson(language = "EN", summary = "  Updated.  ", experiences = emptyList())),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(cv.code))
            .andExpect(jsonPath("$.language").value("EN"))
            .andExpect(jsonPath("$.summary").value("Updated."))
            .andExpect(jsonPath("$.experiences.length()").value(0))

        mvc
            .perform(delete("$baseUrl/${cv.code}").asUser(worker))
            .asyncDispatch()
            .andExpect(status().isNoContent)

        mvc
            .perform(get("$baseUrl/${cv.code}").asUser(worker).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `the CVs of a person are deleted with the person`() {
        val admin = createHelper.createUserEntity(adminAuthorities + PersonAuthority.ADMIN)
        val person = createHelper.createPersonEntity("Aart", "Staartjes")
        val cv = createHelper.createCv(person)

        mvc
            .perform(delete("/api/persons/${person.uuid}").asUser(admin))
            .asyncDispatch()
            .andExpect(status().isNoContent)

        mvc
            .perform(get("$baseUrl/${cv.code}").asUser(admin).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isNotFound)
    }

    @Test
    fun `without CvAuthority the endpoints are forbidden`() {
        val nobody = createHelper.createUserEntity(emptySet())

        mvc
            .perform(get(baseUrl).asUser(nobody).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isForbidden)
        mvc
            .perform(post(baseUrl).asUser(nobody).json(cvJson()))
            .asyncDispatch()
            .andExpect(status().isForbidden)
    }

    /**
     * Wirespec handlers are suspend functions, so a handled request completes through an
     * async dispatch. A body that the contract rejects never reaches the handler: the
     * 400 is written synchronously and there is nothing to dispatch.
     */
    private fun ResultActions.asyncDispatch(): ResultActions {
        val result = andReturn()
        return if (result.request.isAsyncStarted) mvc.perform(MockMvcRequestBuilders.asyncDispatch(result)) else this
    }
}
