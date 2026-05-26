package community.flock.eco.workday.application.config

import community.flock.eco.workday.user.exceptions.UserAccountExistsException
import community.flock.eco.workday.user.forms.UserAccountOauthForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountOauth
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import community.flock.eco.workday.user.services.UserAccountService
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
    private lateinit var userAccountService: UserAccountService
    private lateinit var mockServer: MockRestServiceServer
    private lateinit var resolver: KratosIdentityUserResolver

    @BeforeEach
    fun setUp() {
        userAccountService = mockk()
        val builder = RestClient.builder().baseUrl(issuer)
        mockServer = MockRestServiceServer.bindTo(builder).build()
        resolver = KratosIdentityUserResolver(userAccountService, builder.build())
    }

    @Test
    fun `existing KRATOS account resolves by reference without hitting Hydra`() {
        val user = userWithEmail("alice@flock.community")
        every { userAccountService.findUserAccountOauthByReference("sub-alice") } returns oauth(user, "sub-alice")

        val resolved = resolver.resolve("sub-alice", "access-token-x")

        assertThat(resolved.code).isEqualTo(user.code)
        mockServer.verify() // no expectations set = no Hydra call expected
        verify(exactly = 0) { userAccountService.createUserAccountOauth(any()) }
    }

    @Test
    fun `first sighting fetches userinfo and creates a KRATOS account`() {
        val formSlot = slot<UserAccountOauthForm>()
        val user = userWithEmail("bob@flock.community")
        every { userAccountService.findUserAccountOauthByReference("sub-bob") } returns null
        every { userAccountService.createUserAccountOauth(capture(formSlot)) } answers { oauth(user, "sub-bob") }
        expectUserinfo("token-bob", withSuccess(userinfoBody("bob@flock.community"), MediaType.APPLICATION_JSON))

        val resolved = resolver.resolve("sub-bob", "token-bob")

        assertThat(resolved.email).isEqualTo("bob@flock.community")
        assertThat(formSlot.captured.provider).isEqualTo(UserAccountOauthProvider.KRATOS)
        assertThat(formSlot.captured.reference).isEqualTo("sub-bob")
        assertThat(formSlot.captured.email).isEqualTo("bob@flock.community")
        mockServer.verify()
    }

    @Test
    fun `a resolved account is read by reference on every call and never hits Hydra`() {
        val user = userWithEmail("cached@flock.community")
        every { userAccountService.findUserAccountOauthByReference("sub-cached") } returns oauth(user, "sub-cached")

        repeat(2) { resolver.resolve("sub-cached", "ignored") }

        // The KRATOS UserAccountOauth is the cache: indexed reference lookup each time, no /userinfo call.
        verify(exactly = 2) { userAccountService.findUserAccountOauthByReference("sub-cached") }
        verify(exactly = 0) { userAccountService.createUserAccountOauth(any()) }
        mockServer.verify()
    }

    @Test
    fun `Hydra rejecting the access_token at userinfo surfaces as InvalidBearerTokenException`() {
        every { userAccountService.findUserAccountOauthByReference("sub-bad") } returns null
        expectUserinfo("bad-token", withStatus(HttpStatus.UNAUTHORIZED))

        assertThatExceptionOfType(InvalidBearerTokenException::class.java)
            .isThrownBy { resolver.resolve("sub-bad", "bad-token") }
    }

    @Test
    fun `userinfo 5xx surfaces as HydraUserinfoUnavailableException`() {
        every { userAccountService.findUserAccountOauthByReference("sub-x") } returns null
        expectUserinfo("any-token", withServerError())

        assertThatExceptionOfType(HydraUserinfoUnavailableException::class.java)
            .isThrownBy { resolver.resolve("sub-x", "any-token") }
    }

    @Test
    fun `name claims from userinfo become the created account's name`() {
        val formSlot = slot<UserAccountOauthForm>()
        val user = userWithEmail("named@flock.community", name = "Ada Lovelace")
        every { userAccountService.findUserAccountOauthByReference("sub-named") } returns null
        every { userAccountService.createUserAccountOauth(capture(formSlot)) } answers { oauth(user, "sub-named") }
        expectUserinfo(
            "token-named",
            withSuccess(
                """{"sub":"any","email":"named@flock.community","given_name":"Ada","family_name":"Lovelace"}""",
                MediaType.APPLICATION_JSON,
            ),
        )

        resolver.resolve("sub-named", "token-named")

        assertThat(formSlot.captured.name).isEqualTo("Ada Lovelace")
    }

    @Test
    fun `a concurrent create race re-reads the account by reference instead of failing`() {
        val user = userWithEmail("race@flock.community")
        every { userAccountService.findUserAccountOauthByReference("sub-race") } returnsMany
            listOf(null, oauth(user, "sub-race"))
        every { userAccountService.createUserAccountOauth(any()) } throws UserAccountExistsException(oauth(user, "sub-race"))
        expectUserinfo("token-race", withSuccess(userinfoBody("race@flock.community"), MediaType.APPLICATION_JSON))

        val resolved = resolver.resolve("sub-race", "token-race")

        assertThat(resolved.email).isEqualTo("race@flock.community")
    }

    private fun expectUserinfo(
        accessToken: String,
        responder: org.springframework.test.web.client.ResponseCreator,
    ) {
        mockServer
            .expect(requestTo("$issuer/userinfo"))
            .andExpect(method(org.springframework.http.HttpMethod.GET))
            .andExpect(header(HttpHeaders.AUTHORIZATION, "Bearer $accessToken"))
            .andRespond(responder)
    }

    private fun userinfoBody(email: String): String = """{"sub":"any","email":"$email","given_name":"X","family_name":"Y"}"""

    private fun oauth(
        user: User,
        reference: String,
    ): UserAccountOauth = UserAccountOauth(user = user, reference = reference, provider = UserAccountOauthProvider.KRATOS)

    private fun userWithEmail(
        email: String,
        name: String? = null,
        code: String =
            java.util.UUID
                .randomUUID()
                .toString(),
    ): User =
        User(
            code = code,
            email = email,
            name = name,
            authorities = mutableSetOf(),
        )
}
