package community.flock.eco.workday.application.config

import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import io.mockk.confirmVerified
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatExceptionOfType
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionException
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.header
import org.springframework.test.web.client.match.MockRestRequestMatchers.method
import org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo
import org.springframework.test.web.client.response.MockRestResponseCreators.withServerError
import org.springframework.test.web.client.response.MockRestResponseCreators.withStatus
import org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess
import org.springframework.web.client.RestClient

class KratosOpaqueTokenIntrospectorTest {
    private val kratosUrl = "https://auth.test.local"
    private lateinit var userService: UserService
    private lateinit var mockServer: MockRestServiceServer
    private lateinit var introspector: KratosOpaqueTokenIntrospector

    @BeforeEach
    fun setUp() {
        userService = mockk()
        val builder = RestClient.builder().baseUrl(kratosUrl)
        mockServer = MockRestServiceServer.bindTo(builder).build()
        introspector = KratosOpaqueTokenIntrospector(userService, builder.build())
    }

    @Test
    fun `valid token returns principal whose name is the user code`() {
        val user = userWithEmail("alice@flock.community")
        every { userService.findByEmail("alice@flock.community") } returns user
        expectWhoami("session-token-abc", withSuccess(whoamiBody("alice@flock.community", "Alice"), MediaType.APPLICATION_JSON))

        val principal = introspector.introspect("session-token-abc")

        // Downstream code calls authentication.name which delegates to principal.getName(); it
        // must equal user.code so personService.findByUserCode(authentication.name) keeps working.
        assertThat(principal.name).isEqualTo(user.code)
        mockServer.verify()
    }

    @Test
    fun `missing user is auto-created on first sighting`() {
        val createdSlot = slot<UserForm>()
        every { userService.findByEmail("new.user@flock.community") } returns null
        every { userService.create(capture(createdSlot)) } answers {
            userWithEmail(createdSlot.captured.email, name = createdSlot.captured.name)
        }
        expectWhoami("first-token", withSuccess(whoamiBody("new.user@flock.community", "New User"), MediaType.APPLICATION_JSON))

        introspector.introspect("first-token")

        assertThat(createdSlot.captured.email).isEqualTo("new.user@flock.community")
        assertThat(createdSlot.captured.name).isEqualTo("New User")
        assertThat(createdSlot.captured.authorities).isEmpty()
        verify(exactly = 1) { userService.create(any()) }
    }

    @Test
    fun `expired or invalid token throws BadOpaqueTokenException`() {
        // Spring's OpaqueTokenAuthenticationProvider converts BadOpaqueTokenException into
        // InvalidBearerTokenException, yielding a standard 401 + WWW-Authenticate=Bearer
        // with error="invalid_token".
        expectWhoami("bad-token", withStatus(HttpStatus.UNAUTHORIZED))

        assertThatExceptionOfType(BadOpaqueTokenException::class.java)
            .isThrownBy { introspector.introspect("bad-token") }
        mockServer.verify()
    }

    @Test
    fun `second invalid-token call within TTL window does not hit Kratos again`() {
        // Negative caching absorbs token-spray without delaying recovery.
        expectWhoami("bad-token", withStatus(HttpStatus.UNAUTHORIZED))

        repeat(2) {
            assertThatExceptionOfType(BadOpaqueTokenException::class.java)
                .isThrownBy { introspector.introspect("bad-token") }
        }
        mockServer.verify()
    }

    @Test
    fun `Kratos returning 5xx surfaces as OAuth2IntrospectionException`() {
        // Spring wraps this in AuthenticationServiceException downstream. We deliberately do not
        // distinguish 503 here — the standard Bearer flow returns 401, and a custom entry point
        // would re-introduce the "too much custom code" the reviewer flagged.
        expectWhoami("any-token", withServerError())

        assertThatExceptionOfType(OAuth2IntrospectionException::class.java)
            .isThrownBy { introspector.introspect("any-token") }
        mockServer.verify()
    }

    @Test
    fun `second valid-token call within TTL window does not hit Kratos again`() {
        val user = userWithEmail("alice@flock.community")
        every { userService.findByEmail("alice@flock.community") } returns user
        expectWhoami("cached-token", withSuccess(whoamiBody("alice@flock.community"), MediaType.APPLICATION_JSON))

        val first = introspector.introspect("cached-token")
        val second = introspector.introspect("cached-token")

        assertThat(first.name).isEqualTo(user.code)
        assertThat(second.name).isEqualTo(user.code)
        mockServer.verify()
    }

    @Test
    fun `concurrent first-sight race falls back to second findByEmail on unique constraint`() {
        val user = userWithEmail("race@flock.community")
        every { userService.findByEmail("race@flock.community") } returnsMany listOf(null, user)
        every { userService.create(any()) } throws DataIntegrityViolationException("duplicate email")
        expectWhoami("race-token", withSuccess(whoamiBody("race@flock.community"), MediaType.APPLICATION_JSON))

        val principal = introspector.introspect("race-token")

        assertThat(principal.name).isEqualTo(user.code)
        verify(exactly = 2) { userService.findByEmail("race@flock.community") }
    }

    @Test
    fun `mixed-case email from Kratos resolves existing user via case-insensitive lookup`() {
        // Email normalization is delegated to UserService.findByEmail (findByEmailIgnoreCase). The
        // introspector must not double-normalize, matching the legacy googleLogin path.
        val user = userWithEmail("alice@flock.community")
        every { userService.findByEmail("Alice@Flock.Community") } returns user
        expectWhoami("mixed-token", withSuccess(whoamiBody("Alice@Flock.Community"), MediaType.APPLICATION_JSON))

        val principal = introspector.introspect("mixed-token")

        assertThat(principal.name).isEqualTo(user.code)
        verify(exactly = 1) { userService.findByEmail("Alice@Flock.Community") }
        verify(exactly = 0) { userService.create(any()) }
    }

    @Test
    fun `introspector only resolves Users and never touches UserAccountOauth`() {
        // Guards the ADR invariant: the Google OIDC web path keeps owning UserAccountOauth.
        val user = userWithEmail("guarded@flock.community")
        every { userService.findByEmail("guarded@flock.community") } returns user
        expectWhoami("guard-token", withSuccess(whoamiBody("guarded@flock.community"), MediaType.APPLICATION_JSON))

        introspector.introspect("guard-token")

        verify(exactly = 1) { userService.findByEmail("guarded@flock.community") }
        confirmVerified(userService)
    }

    private fun expectWhoami(
        token: String,
        responder: org.springframework.test.web.client.ResponseCreator,
    ) {
        mockServer.expect(requestTo("$kratosUrl/sessions/whoami"))
            .andExpect(method(org.springframework.http.HttpMethod.GET))
            .andExpect(header("X-Session-Token", token))
            .andRespond(responder)
    }

    private fun whoamiBody(email: String, name: String? = null): String {
        val nameField = name?.let { ", \"name\": \"$it\"" } ?: ""
        return """{"identity":{"traits":{"email":"$email"$nameField}}}"""
    }

    private fun userWithEmail(
        email: String,
        name: String? = null,
    ): User =
        User(
            email = email,
            name = name,
            authorities = mutableSetOf(),
        )
}
