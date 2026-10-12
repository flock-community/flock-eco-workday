package community.flock.eco.workday.controllers

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.eco.workday.WorkdayIntegrationTest
import community.flock.eco.workday.application.authorities.ClientAuthority
import community.flock.eco.workday.helpers.CreateHelper
import community.flock.eco.workday.user.mappers.toDomain
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType.APPLICATION_JSON
import org.springframework.http.MediaType.IMAGE_PNG
import org.springframework.mock.web.MockMultipartFile
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

class ClientControllerTest(
    @Autowired private val mvc: MockMvc,
    @Autowired private val mapper: ObjectMapper,
    @Autowired private val createHelper: CreateHelper,
) : WorkdayIntegrationTest() {
    private val baseUrl: String = "/api/clients"

    private val logoBytes = byteArrayOf(0x89.toByte(), 0x50, 0x4E, 0x47)

    private fun writer() = user(CreateHelper.UserSecurity(createHelper.createUser(setOf(ClientAuthority.READ, ClientAuthority.WRITE))))

    private fun uploadLogo(filename: String): ResultActions =
        mvc.perform(
            multipart("$baseUrl/logos")
                .file(MockMultipartFile("file", filename, IMAGE_PNG.toString(), logoBytes))
                .with(writer()),
        )

    @Test
    fun `client stores an uploaded logo and serves it back`() {
        val file =
            uploadLogo("acme.png")
                .andExpect(status().isOk)
                .andReturn()
                .response.contentAsString
                .let { mapper.readValue(it, String::class.java) }

        val code =
            mvc
                .perform(
                    post(baseUrl)
                        .with(writer())
                        .content(mapper.writeValueAsString(mapOf("name" to "Acme", "logo" to mapOf("name" to "acme.png", "file" to file))))
                        .contentType(APPLICATION_JSON)
                        .accept(APPLICATION_JSON),
                ).asyncDispatch()
                .andExpect(status().isOk)
                .andExpect(jsonPath("$.logo.name").value("acme.png"))
                .andExpect(jsonPath("$.logo.file").value(file))
                .andReturn()
                .response.contentAsString
                .let { mapper.readTree(it)["code"].asText() }

        mvc
            .perform(get("$baseUrl/$code").with(writer()).accept(APPLICATION_JSON))
            .asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(code))
            .andExpect(jsonPath("$.logo.file").value(file))

        mvc
            .perform(get("$baseUrl/logos/$file/acme.png").with(writer()))
            .andExpect(status().isOk)
            .andExpect(content().contentType(IMAGE_PNG))
            .andExpect(content().bytes(logoBytes))
    }

    @Test
    fun `updating a client keeps its code and can remove the logo`() {
        val client = createHelper.createClient("Acme")
        val file =
            uploadLogo("acme.png")
                .andReturn()
                .response.contentAsString
                .let { mapper.readValue(it, String::class.java) }

        mvc
            .perform(
                put("$baseUrl/${client.code}")
                    .with(writer())
                    .content(mapper.writeValueAsString(mapOf("name" to "Acme", "logo" to mapOf("name" to "acme.png", "file" to file))))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(client.code))
            .andExpect(jsonPath("$.logo.file").value(file))

        mvc
            .perform(
                put("$baseUrl/${client.code}")
                    .with(writer())
                    .content(mapper.writeValueAsString(mapOf("name" to "Acme")))
                    .contentType(APPLICATION_JSON)
                    .accept(APPLICATION_JSON),
            ).asyncDispatch()
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.code").value(client.code))
            .andExpect(jsonPath("$.logo").doesNotExist())
    }

    @Test
    fun `logo upload rejects files that are not raster images`() {
        uploadLogo("logo.svg").andExpect(status().isBadRequest)
        uploadLogo("page.html").andExpect(status().isBadRequest)
    }

    private fun ResultActions.asyncDispatch(): ResultActions = mvc.perform(MockMvcRequestBuilders.asyncDispatch(this.andReturn()))
}
