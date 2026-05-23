package community.flock.eco.workday.application.config

import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatExceptionOfType
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException
import org.springframework.test.web.client.MockRestServiceServer
import org.springframework.test.web.client.match.MockRestRequestMatchers.header
import org.springframework.test.web.client.match.MockRestRequestMatchers.method
import org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo
import org.springframework.test.web.client.response.MockRestResponseCreators.withServerError
import org.springframework.test.web.client.response.MockRestResponseCreators.withStatus
import org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess
import org.springframework.web.client.RestClient

class KratosIdentityUserResolverTest {
    private val issuer = "https://auth.test.local"
    private lateinit var userService: UserService
    private lateinit var mockServer: MockRestServiceServer
    private lateinit var resolver: KratosIdentityUserResolver

    @BeforeEach
    fun setUp() {
        userService = mockk()
        val builder = RestClient.builder().baseUrl(issuer)
        mockServer = MockRestServiceServer.bindTo(builder).build()
        resolver = KratosIdentityUserResolver(userService, builder.build())
    }

    @Test
    fun `existing user with linked kratos_identity_id resolves without hitting Hydra`() {
        val user = userWithEmail("alice@flock.community", kratos = "sub-alice")
        every { userService.findByKratosIdentityId("sub-alice") } returns user

        val resolved = resolver.resolve("sub-alice", "access-token-x")

        assertThat(resolved.code).isEqualTo(user.code)
        mockServer.verify() // no expectations set = no Hydra call expected
        verify(exactly = 0) { userService.findByEmail(any()) }
    }

    @Test
    fun `unlinked existing-by-email user is linked on first sighting via userinfo`() {
        val user = userWithEmail("bob@flock.community")
        every { userService.findByKratosIdentityId("sub-bob") } returns null
        every { userService.findByEmail("bob@flock.community") } returns user
        every { userService.linkKratosIdentity(user.code, "sub-bob") } returns
            userWithEmail("bob@flock.community", code = user.code, kratos = "sub-bob")
        expectUserinfo("token-bob", withSuccess(userinfoBody("bob@flock.community"), MediaType.APPLICATION_JSON))

        val resolved = resolver.resolve("sub-bob", "token-bob")

        assertThat(resolved.email).isEqualTo("bob@flock.community")
        verify(exactly = 1) { userService.linkKratosIdentity(user.code, "sub-bob") }
        mockServer.verify()
    }

    @Test
    fun `first-time user is auto-created and linked`() {
        val createdSlot = slot<UserForm>()
        every { userService.findByKratosIdentityId("sub-new") } returns null
        every { userService.findByEmail("new.user@flock.community") } returns null
        every { userService.create(capture(createdSlot)) } answers {
            userWithEmail(createdSlot.captured.email, name = createdSlot.captured.name)
        }
        every { userService.linkKratosIdentity(any(), "sub-new") } answers {
            userWithEmail("new.user@flock.community", code = firstArg(), kratos = "sub-new")
        }
        expectUserinfo("token-new", withSuccess(userinfoBody("new.user@flock.community"), MediaType.APPLICATION_JSON))

        resolver.resolve("sub-new", "token-new")

        assertThat(createdSlot.captured.email).isEqualTo("new.user@flock.community")
        verify(exactly = 1) { userService.create(any()) }
        verify(exactly = 1) { userService.linkKratosIdentity(any(), "sub-new") }
    }

    @Test
    fun `second resolve for same sub hits the in-memory cache`() {
        val user = userWithEmail("cached@flock.community", kratos = "sub-cached")
        every { userService.findByKratosIdentityId("sub-cached") } returns user
        every { userService.findByCode(user.code) } returns user

        repeat(2) { resolver.resolve("sub-cached", "ignored") }

        // First call: DB lookup. Second call: cache hit → findByCode only.
        verify(exactly = 1) { userService.findByKratosIdentityId("sub-cached") }
        verify(exactly = 1) { userService.findByCode(user.code) }
    }

    @Test
    fun `Hydra rejecting the access_token at userinfo surfaces as InvalidBearerTokenException`() {
        every { userService.findByKratosIdentityId("sub-bad") } returns null
        expectUserinfo("bad-token", withStatus(HttpStatus.UNAUTHORIZED))

        assertThatExceptionOfType(InvalidBearerTokenException::class.java)
            .isThrownBy { resolver.resolve("sub-bad", "bad-token") }
    }

    @Test
    fun `userinfo 5xx surfaces as HydraUserinfoUnavailableException`() {
        every { userService.findByKratosIdentityId("sub-x") } returns null
        expectUserinfo("any-token", withServerError())

        assertThatExceptionOfType(HydraUserinfoUnavailableException::class.java)
            .isThrownBy { resolver.resolve("sub-x", "any-token") }
    }

    @Test
    fun `cache entry pointing at a deleted user falls through to DB and re-resolves`() {
        val user = userWithEmail("rejoin@flock.community", kratos = "sub-rejoin")
        every { userService.findByKratosIdentityId("sub-rejoin") } returns user
        // The cache is empty on the first resolve, so findByCode is never called there.
        // After the cache is seeded, the user "disappears" (deleted between requests) so
        // findByCode returns null on every subsequent call.
        every { userService.findByCode(user.code) } returns null

        // First call seeds the cache via the DB lookup.
        resolver.resolve("sub-rejoin", "ignored")

        // Second call: cache says user.code, findByCode returns null (user gone), so the
        // resolver evicts the cache and re-runs the DB lookup, which still finds the row.
        val again = resolver.resolve("sub-rejoin", "ignored")
        assertThat(again.code).isEqualTo(user.code)

        verify(exactly = 2) { userService.findByKratosIdentityId("sub-rejoin") }
        verify(exactly = 1) { userService.findByCode(user.code) }
    }

    private fun expectUserinfo(
        accessToken: String,
        responder: org.springframework.test.web.client.ResponseCreator,
    ) {
        mockServer.expect(requestTo("$issuer/userinfo"))
            .andExpect(method(org.springframework.http.HttpMethod.GET))
            .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer $accessToken"))
            .andRespond(responder)
    }

    private fun userinfoBody(email: String): String =
        """{"sub":"any","email":"$email","given_name":"X","family_name":"Y"}"""

    private fun userWithEmail(
        email: String,
        name: String? = null,
        code: String = java.util.UUID.randomUUID().toString(),
        kratos: String? = null,
    ): User = User(
        code = code,
        email = email,
        name = name,
        authorities = mutableSetOf(),
        kratosIdentityId = kratos,
    )

}
