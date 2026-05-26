package community.flock.eco.workday.application.config

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import community.flock.eco.workday.user.exceptions.UserAccountExistsException
import community.flock.eco.workday.user.forms.UserAccountOauthForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import community.flock.eco.workday.user.services.UserAccountService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Conditional
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.http.converter.HttpMessageConversionException
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestClientResponseException
import java.time.Duration

/**
 * Resolves a Hydra-issued JWT (its `sub` claim and the bearer token) to a workday [User].
 *
 * The Kratos identity is stored the same way every other OAuth identity is: as a
 * [UserAccountOauth] row with `provider = KRATOS` and `reference = sub`. This mirrors the
 * Google web-login path ([UserSecurityService]), so a user has exactly one home for all
 * their external identities and no parallel column is needed.
 *
 * Algorithm:
 *  1. Look up the [UserAccountOauth] by reference (`sub`) → return its user. The lookup is
 *     a single indexed query and doubles as the persistent cache; no in-memory layer.
 *  2. GET Hydra `/userinfo` with the inbound access_token (Bearer) → `email` + name claims.
 *  3. `createUserAccountOauth(KRATOS, sub)` → find-or-create the user by email and attach
 *     the Kratos account:
 *      - user exists by email (e.g. a long-time Google-web user): the new KRATOS account is
 *        linked to that existing user — they're now reachable from mobile too.
 *      - no such user: a new one is auto-created (same path as Google first-login).
 *
 * Step 2+3 happen exactly once per `sub` ever: once the account exists, every later request
 * resolves via the indexed lookup in step 1 without leaving the process. JWT signature
 * verification is handled by Spring's JwtDecoder upstream (Hydra JWKS, cached).
 *
 * Designed in flock-app/docs/adr/0003-mobile-auth-via-hydra-pkce.md (plan-W1).
 */
@Component
@Conditional(HydraIssuerConfigured::class)
class KratosIdentityUserResolver(
    private val userAccountService: UserAccountService,
    @Qualifier("hydraUserinfoRestClient") private val restClient: RestClient,
) {
    private val log = LoggerFactory.getLogger(KratosIdentityUserResolver::class.java)

    /**
     * Returns the workday [User] for the given JWT `sub` claim, using [accessToken] only
     * if the resolver has to fall through to Hydra's `/userinfo` endpoint (first sight).
     *
     * Throws [InvalidBearerTokenException] if Hydra 401s or `/userinfo` returns no email
     * — both indicate a token that was structurally valid but no longer authoritative.
     * Throws [HydraUserinfoUnavailableException] if Hydra cannot be reached (→ 503).
     */
    fun resolve(
        sub: String,
        accessToken: String,
    ): User {
        findUserByReference(sub)?.let { return it }

        val info = fetchUserinfo(accessToken)
        val email =
            info.email
                ?: throw InvalidBearerTokenException("Hydra /userinfo did not return an email for sub=$sub")
        return findOrCreateAccount(sub, email, info.displayName())
    }

    private fun findUserByReference(sub: String): User? = userAccountService.findUserAccountOauthByReference(sub)?.user

    private fun fetchUserinfo(accessToken: String): HydraUserinfo =
        try {
            restClient
                .get()
                .uri("/userinfo")
                .header("Authorization", "Bearer $accessToken")
                .retrieve()
                .body(HydraUserinfo::class.java)
                ?: throw HydraUserinfoUnavailableException("Hydra /userinfo returned an empty body")
        } catch (ex: RestClientResponseException) {
            when (ex.statusCode) {
                HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN ->
                    throw InvalidBearerTokenException("Hydra rejected the access_token at /userinfo")
                else -> {
                    log.warn("Hydra /userinfo returned {}", ex.statusCode)
                    throw HydraUserinfoUnavailableException("Hydra returned ${ex.statusCode}", ex)
                }
            }
        } catch (ex: RestClientException) {
            log.warn("Hydra /userinfo call failed", ex)
            throw HydraUserinfoUnavailableException("Hydra /userinfo call failed", ex)
        } catch (ex: HttpMessageConversionException) {
            log.warn("Hydra /userinfo returned an unparseable response", ex)
            throw HydraUserinfoUnavailableException("Hydra /userinfo returned an unparseable response", ex)
        }

    private fun findOrCreateAccount(
        sub: String,
        email: String,
        name: String?,
    ): User =
        try {
            userAccountService
                .createUserAccountOauth(
                    UserAccountOauthForm(
                        email = email,
                        name = name,
                        reference = sub,
                        provider = UserAccountOauthProvider.KRATOS,
                    ),
                ).user
        } catch (ex: UserAccountExistsException) {
            // Concurrent first-sight race: another request created the KRATOS account.
            // Re-read by reference rather than failing.
            findUserByReference(sub) ?: throw ex
        }
}

/**
 * Hydra `/userinfo` was unreachable or returned an unexpected error — a transient
 * server-side failure, not a bad token. Extends [AuthenticationException] so the
 * resource-server filter routes it to [HydraAuthenticationEntryPoint], which maps it to
 * HTTP 503 (rather than the 401 a bad token gets, or the 500 a raw exception would).
 */
class HydraUserinfoUnavailableException(
    message: String,
    cause: Throwable? = null,
) : AuthenticationException(message, cause)

/**
 * Dedicated [RestClient] for the resolver. Explicit timeouts so a slow Hydra cannot pin
 * Tomcat threads — same pattern PR #488 used for the Kratos client it replaced.
 */
@Configuration
@Conditional(HydraIssuerConfigured::class)
class HydraUserinfoRestClientConfig {
    @Bean("hydraUserinfoRestClient")
    fun hydraUserinfoRestClient(
        builder: RestClient.Builder,
        @Value("\${spring.security.oauth2.resourceserver.jwt.issuer-uri:https://auth.flock.community}")
        issuerUri: String,
    ): RestClient =
        builder
            .baseUrl(issuerUri)
            .requestFactory(
                SimpleClientHttpRequestFactory().apply {
                    setConnectTimeout(Duration.ofSeconds(2))
                    setReadTimeout(Duration.ofSeconds(3))
                },
            ).build()
}

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class HydraUserinfo(
    val sub: String?,
    val email: String?,
    val given_name: String?,
    val family_name: String?,
) {
    /** "Given Family" if either name claim is present, else null (User.name is nullable). */
    fun displayName(): String? =
        listOfNotNull(given_name, family_name)
            .joinToString(" ")
            .ifBlank { null }
}
