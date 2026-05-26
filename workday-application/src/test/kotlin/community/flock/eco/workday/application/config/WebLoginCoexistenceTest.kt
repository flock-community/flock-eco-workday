package community.flock.eco.workday.application.config

import community.flock.eco.workday.application.Application
import community.flock.eco.workday.config.AppTestConfig
import community.flock.eco.workday.user.forms.UserAccountOauthForm
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.utils.CleanupDbService
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.autoconfigure.web.client.AutoConfigureWebClient
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.mock.web.MockHttpSession
import org.springframework.security.oauth2.jwt.BadJwtException
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.servlet.function.RequestPredicates
import org.springframework.web.servlet.function.RouterFunction
import org.springframework.web.servlet.function.RouterFunctions
import org.springframework.web.servlet.function.ServerResponse
import java.time.Instant

/**
 * Proves browser/session login still works when the Hydra JWT resource server shares the same
 * [SecurityFilterChain]. Unlike [WorkdayIntegrationTest] (empty issuer-uri, JWT chain off), this
 * boots with issuer-uri set so the resource-server block is active; a stub [JwtDecoder] stands in
 * for Hydra so no JWKS discovery happens.
 */
@ActiveProfiles("test")
@AutoConfigureDataJpa
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@AutoConfigureWebClient
@Import(WebLoginCoexistenceTest.TestBeans::class)
@SpringBootTest(
    classes = [Application::class, AppTestConfig::class],
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    // issuer-uri (empty in application-test.properties) is set so the JWT beans wire and the
    // resource-server block runs; the stub JwtDecoder keeps it offline. SessionAutoConfiguration is
    // excluded so sessions stay in-memory — the test profile never creates the JDBC session table.
    properties = [
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=https://issuer.test.local",
        "spring.autoconfigure.exclude=" +
            "org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration," +
            "org.springframework.boot.autoconfigure.session.SessionAutoConfiguration",
    ],
)
class WebLoginCoexistenceTest {
    @Autowired private lateinit var mockMvc: MockMvc

    @Autowired private lateinit var userAccountService: UserAccountService

    @Autowired private lateinit var cleanupDbService: CleanupDbService

    @AfterEach
    fun resetDb() = cleanupDbService.cleanup()

    @Test
    fun `unauthenticated browser navigation still redirects to the login page`() {
        mockMvc
            .perform(get(PROBE).header("Accept", "text/html"))
            .andExpect(status().is3xxRedirection)
    }

    @Test
    fun `unauthenticated non-bearer XHR still redirects, not a bearer 401`() {
        mockMvc
            .perform(get(PROBE).header("Accept", "application/json"))
            .andExpect(status().is3xxRedirection)
    }

    @Test
    fun `form login establishes a session that reaches a secured endpoint`() {
        val email = "form.coexist@flock.community"

        // testLogin auto-creates a password account (password == username) on first login.
        val session =
            mockMvc
                .perform(post("/login").param("username", email).param("password", email))
                .andExpect(status().is3xxRedirection)
                .andReturn()
                .request
                .getSession(false) as MockHttpSession

        mockMvc
            .perform(get(PROBE).session(session))
            .andExpect(status().isOk)
    }

    @Test
    fun `a valid Bearer token resolves through the converter to its user`() {
        val account =
            userAccountService.createUserAccountOauth(
                UserAccountOauthForm(
                    email = "kratos.coexist@flock.community",
                    name = "Kratos Coexist",
                    reference = SUB,
                    provider = UserAccountOauthProvider.KRATOS,
                ),
            )

        mockMvc
            .perform(get(PROBE).header("Authorization", "Bearer $VALID_TOKEN"))
            .andExpect(status().isOk)
            .andExpect(content().string(account.user.code))
    }

    @Test
    fun `an unrecognised Bearer token is rejected with 401`() {
        mockMvc
            .perform(get(PROBE).header("Authorization", "Bearer not-a-known-token"))
            .andExpect(status().isUnauthorized)
    }

    @TestConfiguration
    class TestBeans {
        @Bean
        fun jwtDecoder(): JwtDecoder =
            JwtDecoder { token ->
                if (token != VALID_TOKEN) throw BadJwtException("stub decoder rejects '$token'")
                val now = Instant.now()
                Jwt
                    .withTokenValue(token)
                    .header("alg", "none")
                    .subject(SUB)
                    .issuedAt(now)
                    .expiresAt(now.plusSeconds(300))
                    .build()
            }

        @Bean
        fun authProbeRoute(): RouterFunction<ServerResponse> =
            RouterFunctions.route(RequestPredicates.GET("/api/_authprobe")) { request ->
                ServerResponse.ok().body(request.principal().map { it.name }.orElse(""))
            }
    }

    companion object {
        private const val PROBE = "/api/_authprobe"
        private const val VALID_TOKEN = "valid.kratos.token"
        private const val SUB = "kratos-sub-web-coexist"
    }
}
