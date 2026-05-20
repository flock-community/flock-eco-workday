package community.flock.eco.workday.application.config

import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import io.mockk.confirmVerified
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import jakarta.servlet.FilterChain
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.header
import org.springframework.test.web.client.match.MockRestRequestMatchers.method
import org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo
import org.springframework.test.web.client.response.MockRestResponseCreators.withServerError
import org.springframework.test.web.client.response.MockRestResponseCreators.withStatus
import org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess
import org.springframework.web.client.RestClient

class KratosSessionFilterTest {
    private val kratosUrl = "https://auth.test.local"
    private lateinit var userService: UserService
    private lateinit var mockServer: MockRestServiceServer
    private lateinit var filter: KratosSessionFilter
    private lateinit var chain: FilterChain

    @BeforeEach
    fun setUp() {
        userService = mockk()
        val builder = RestClient.builder().baseUrl(kratosUrl)
        mockServer = MockRestServiceServer.bindTo(builder).build()
        filter = KratosSessionFilter(userService, builder.build())
        chain = mockk(relaxed = true)
        SecurityContextHolder.clearContext()
    }

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
        mockServer.verify()
    }

    @Test
    fun `valid token populates SecurityContext with existing user`() {
        val user = userWithEmail("alice@flock.community")
        every { userService.findByEmail("alice@flock.community") } returns user
        expectWhoami("session-token-abc", withSuccess(whoamiBody("alice@flock.community", "Alice"), MediaType.APPLICATION_JSON))

        val request = bearer("session-token-abc")
        val response = MockHttpServletResponse()
        filter.doFilter(request, response, chain)

        val auth = SecurityContextHolder.getContext().authentication
        assertThat(auth).isInstanceOf(UsernamePasswordAuthenticationToken::class.java)
        assertThat(auth.principal).isEqualTo(user.code)
        verify { chain.doFilter(request, response) }
    }

    @Test
    fun `missing user is auto-created on first sighting`() {
        val createdSlot = slot<UserForm>()
        every { userService.findByEmail("new.user@flock.community") } returns null
        every { userService.create(capture(createdSlot)) } answers {
            userWithEmail(createdSlot.captured.email, name = createdSlot.captured.name)
        }
        expectWhoami("first-token", withSuccess(whoamiBody("new.user@flock.community", "New User"), MediaType.APPLICATION_JSON))

        filter.doFilter(bearer("first-token"), MockHttpServletResponse(), chain)

        assertThat(createdSlot.captured.email).isEqualTo("new.user@flock.community")
        assertThat(createdSlot.captured.name).isEqualTo("New User")
        assertThat(createdSlot.captured.authorities).isEmpty()
        verify(exactly = 1) { userService.create(any()) }
    }

    @Test
    fun `expired or invalid token leaves SecurityContext untouched`() {
        expectWhoami("bad-token", withStatus(HttpStatus.UNAUTHORIZED))

        val response = MockHttpServletResponse()
        filter.doFilter(bearer("bad-token"), response, chain)

        assertThat(SecurityContextHolder.getContext().authentication).isNull()
        assertThat(response.status).isEqualTo(HttpStatus.OK.value())
        verify { chain.doFilter(any(), any()) }
    }

    @Test
    fun `second invalid-token request within TTL window does not hit Kratos again`() {
        // Negative caching absorbs token-spray without delaying recovery: short TTL,
        // but enough to avoid a Kratos call per request when an attacker sprays garbage.
        expectWhoami("bad-token", withStatus(HttpStatus.UNAUTHORIZED))

        filter.doFilter(bearer("bad-token"), MockHttpServletResponse(), chain)
        filter.doFilter(bearer("bad-token"), MockHttpServletResponse(), chain)

        assertThat(SecurityContextHolder.getContext().authentication).isNull()
        // mockServer.verify() in @AfterEach asserts only the single expected call happened.
    }

    @Test
    fun `Kratos returning 5xx responds 503 and does not call filter chain`() {
        expectWhoami("any-token", withServerError())

        val response = MockHttpServletResponse()
        filter.doFilter(bearer("any-token"), response, chain)

        assertThat(response.status).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE.value())
        verify(exactly = 0) { chain.doFilter(any(), any()) }
    }

    @Test
    fun `no Authorization header skips Kratos and proceeds`() {
        val request = MockHttpServletRequest()
        val response = MockHttpServletResponse()
        filter.doFilter(request, response, chain)

        assertThat(SecurityContextHolder.getContext().authentication).isNull()
        verify { chain.doFilter(request, response) }
        confirmVerified(userService)
    }

    @Test
    fun `non-Bearer Authorization header is ignored by this filter`() {
        // UserKeyTokenFilter handles `TOKEN ...` separately; this filter must not interfere.
        val request = MockHttpServletRequest().apply { addHeader("Authorization", "TOKEN abc123") }
        val response = MockHttpServletResponse()
        filter.doFilter(request, response, chain)

        assertThat(SecurityContextHolder.getContext().authentication).isNull()
        verify { chain.doFilter(request, response) }
        confirmVerified(userService)
    }

    @Test
    fun `second request within TTL window does not hit Kratos again`() {
        val user = userWithEmail("alice@flock.community")
        every { userService.findByEmail("alice@flock.community") } returns user
        expectWhoami("cached-token", withSuccess(whoamiBody("alice@flock.community"), MediaType.APPLICATION_JSON))

        filter.doFilter(bearer("cached-token"), MockHttpServletResponse(), chain)
        SecurityContextHolder.clearContext()
        filter.doFilter(bearer("cached-token"), MockHttpServletResponse(), chain)

        assertThat(SecurityContextHolder.getContext().authentication).isNotNull()
        // mockServer.verify() in @AfterEach asserts only the single expected call happened.
    }

    @Test
    fun `concurrent first-sight race falls back to second findByEmail on unique constraint`() {
        val user = userWithEmail("race@flock.community")
        every { userService.findByEmail("race@flock.community") } returnsMany listOf(null, user)
        every { userService.create(any()) } throws DataIntegrityViolationException("duplicate email")
        expectWhoami("race-token", withSuccess(whoamiBody("race@flock.community"), MediaType.APPLICATION_JSON))

        filter.doFilter(bearer("race-token"), MockHttpServletResponse(), chain)

        assertThat(SecurityContextHolder.getContext().authentication?.principal).isEqualTo(user.code)
        verify(exactly = 2) { userService.findByEmail("race@flock.community") }
    }

    @Test
    fun `mixed-case email from Kratos resolves existing user via case-insensitive lookup`() {
        // Email normalization is delegated to UserService.findByEmail (which uses
        // findByEmailIgnoreCase) — the filter must not double-normalize, otherwise it
        // would diverge from the legacy googleLogin path that passes email as-given.
        val user = userWithEmail("alice@flock.community")
        every { userService.findByEmail("Alice@Flock.Community") } returns user
        expectWhoami("mixed-token", withSuccess(whoamiBody("Alice@Flock.Community"), MediaType.APPLICATION_JSON))

        filter.doFilter(bearer("mixed-token"), MockHttpServletResponse(), chain)

        assertThat(SecurityContextHolder.getContext().authentication?.principal).isEqualTo(user.code)
        verify(exactly = 1) { userService.findByEmail("Alice@Flock.Community") }
        verify(exactly = 0) { userService.create(any()) }
    }

    @Test
    fun `filter only resolves Users and never touches UserAccountOauth`() {
        // Guards the ADR's invariant: Google OIDC web path keeps owning UserAccountOauth.
        // We assert by confirming only findByEmail was called on userService — any account-
        // related call would have to go through a different (unmocked) method.
        val user = userWithEmail("guarded@flock.community")
        every { userService.findByEmail("guarded@flock.community") } returns user
        expectWhoami("guard-token", withSuccess(whoamiBody("guarded@flock.community"), MediaType.APPLICATION_JSON))

        filter.doFilter(bearer("guard-token"), MockHttpServletResponse(), chain)

        verify(exactly = 1) { userService.findByEmail("guarded@flock.community") }
        confirmVerified(userService)
    }

    private fun bearer(token: String): MockHttpServletRequest =
        MockHttpServletRequest().apply { addHeader("Authorization", "Bearer $token") }

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
