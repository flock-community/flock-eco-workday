package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.CvAuthority
import community.flock.eco.workday.application.forms.CvExperienceForm
import community.flock.eco.workday.application.services.CvService
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toDomain
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
import java.time.YearMonth
import java.util.Base64
import java.util.UUID
import kotlin.test.assertNull
import community.flock.eco.workday.user.model.User as UserEntity

class LogoControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
    @Autowired private val cvService: CvService,
) : WorkdayIntegrationTest() {
    private val baseUrl = "/api/logos"

    private val png = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0x0D)
    private val svg = """<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>""".toByteArray()

    private fun logoJson(
        name: String? = "ING ${UUID.randomUUID()}",
        image: ByteArray? = png,
        asDataUrl: Boolean = false,
    ): String {
        val base64 = image?.let { Base64.getEncoder().encodeToString(it) }
        return mapper.writeValueAsString(
            mapOf("name" to name, "image" to if (asDataUrl && base64 != null) "data:image/whatever;base64,$base64" else base64),
        )
    }

    private fun MockHttpServletRequestBuilder.asUser(user: UserEntity) = with(user(CreateHelper.UserSecurity(user.toDomain())))

    private fun MockHttpServletRequestBuilder.json(body: String) = content(body).contentType(APPLICATION_JSON).accept(APPLICATION_JSON)

    private fun create(
        writer: UserEntity,
        name: String,
        image: ByteArray = png,
    ): String =
        mvc
            .perform(post(baseUrl).asUser(writer).json(logoJson(name = name, image = image)))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andReturn()
            .response.contentAsString
            .let { mapper.readTree(it)["id"].asText() }

    @Test
    fun `a CV writer adds a logo, with the type of its bytes rather than of the upload`() {
        val writer = createHelper.createUserEntity(setOf(CvAuthority.WRITE))
        val name = "Osiris ${UUID.randomUUID()}"

        mvc
            .perform(post(baseUrl).asUser(writer).json(logoJson(name = " $name ", image = svg, asDataUrl = true)))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").exists())
            .andExpect(jsonPath("$.name").value(name))
            .andExpect(jsonPath("$.contentType").value("image/svg+xml"))
            .andExpect(jsonPath("$.updatedAt").exists())

        // Everybody signed in sees the shared logos
        val reader = createHelper.createUserEntity(emptySet())
        mvc
            .perform(get(baseUrl).asUser(reader).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[?(@.name == '$name')].contentType").value("image/svg+xml"))
    }

    @Test
    fun `the image is served with its type, cached and without running any script`() {
        val writer = createHelper.createUserEntity(setOf(CvAuthority.WRITE))
        val id = create(writer, "Bol ${UUID.randomUUID()}")

        mvc
            .perform(get("$baseUrl/$id/image").asUser(createHelper.createUserEntity(emptySet())))
            .andExpect(status().isOk)
            .andExpect(content().contentType("image/png"))
            .andExpect(content().bytes(png))
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().string("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox"))
            .andExpect(header().exists("ETag"))

        mvc
            .perform(get("$baseUrl/${UUID.randomUUID()}/image").asUser(writer))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `a logo needs a free name and an image of a known type`() {
        val writer = createHelper.createUserEntity(setOf(CvAuthority.WRITE))
        val name = "DHL ${UUID.randomUUID()}"
        create(writer, name)

        listOf(
            logoJson(name = name.lowercase()) to (409 to "There already is a logo named '${name.lowercase()}'"),
            logoJson(name = " ") to (400 to "name is required"),
            logoJson(name = "x".repeat(101)) to (400 to "name may be at most 100 characters"),
            logoJson(image = null) to (400 to "image is required"),
            logoJson(image = "<html><script>alert(1)</script></html>".toByteArray()) to (400 to "image must be a PNG, JPEG, GIF, WebP or SVG"),
            logoJson(image = png + ByteArray(512 * 1024)) to (400 to "image may be at most 512 KB"),
        ).forEach { (body, expected) ->
            mvc
                .perform(post(baseUrl).asUser(writer).json(body))
                .asyncDispatch()
                .andExpect(status().`is`(expected.first))
                .andExpect(jsonPath("$.message").value(expected.second))
        }
    }

    @Test
    fun `only a CV admin renames, replaces or deletes a logo, and a deleted logo leaves the assignments`() {
        val writer = createHelper.createUserEntity(setOf(CvAuthority.WRITE))
        val admin = createHelper.createUserEntity(setOf(CvAuthority.ADMIN))
        val id = create(writer, "Capgemini ${UUID.randomUUID()}")
        val renamed = "Capgemini NL ${UUID.randomUUID()}"

        mvc
            .perform(put("$baseUrl/$id").asUser(writer).json(logoJson(name = renamed)))
            .asyncDispatch()
            .andExpect(status().isForbidden)
        mvc
            .perform(put("$baseUrl/$id").asUser(admin).json(logoJson(name = renamed, image = svg)))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.name").value(renamed))
            .andExpect(jsonPath("$.contentType").value("image/svg+xml"))
        // Renaming alone keeps the image
        mvc
            .perform(put("$baseUrl/$id").asUser(admin).json(logoJson(name = "$renamed!", image = null)))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.contentType").value("image/svg+xml"))

        val cv =
            createHelper.createCv(
                createHelper.createPersonEntity(),
                experiences =
                    listOf(
                        CvExperienceForm(
                            from = YearMonth.of(2020, 1),
                            role = "Engineer",
                            client = "Capgemini",
                            logoId = UUID.fromString(id),
                        ),
                    ),
            )

        mvc
            .perform(delete("$baseUrl/$id").asUser(writer))
            .asyncDispatch()
            .andExpect(status().isForbidden)
        mvc
            .perform(delete("$baseUrl/$id").asUser(admin))
            .asyncDispatch()
            .andExpect(status().isNoContent)
        mvc
            .perform(delete("$baseUrl/$id").asUser(admin))
            .asyncDispatch()
            .andExpect(status().isNotFound)

        assertNull(cvService.findByCode(cv.code)!!.experiences.single().logoId)
    }

    @Test
    fun `adding a logo takes CvAuthority WRITE or ADMIN`() {
        val reader = createHelper.createUserEntity(setOf(CvAuthority.READ))

        mvc
            .perform(post(baseUrl).asUser(reader).json(logoJson()))
            .asyncDispatch()
            .andExpect(status().isForbidden)
    }

    private fun ResultActions.asyncDispatch(): ResultActions {
        val result = andReturn()
        return if (result.request.isAsyncStarted) mvc.perform(MockMvcRequestBuilders.asyncDispatch(result)) else this
    }
}
