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
 * Resolves a Hydra JWT's `sub` claim to a workday [User].
 *
 * The Kratos identity is stored like any other OAuth identity: a [UserAccountOauth] with
 * `provider = KRATOS` and `reference = sub`, mirroring the Google web-login path. A known
 * `sub` resolves via the indexed reference lookup, which doubles as the persistent cache.
 * On first sight only, we fetch Hydra `/userinfo` for the email and find-or-create the
 * account: an existing user (e.g. a Google-web user) gains a linked KRATOS account, otherwise
 * a new user is created (same path as Google first-login).
 */
@Component
@Conditional(HydraIssuerConfigured::class)
class KratosIdentityUserResolver(
    private val userAccountService: UserAccountService,
    @Qualifier("hydraUserinfoRestClient") private val restClient: RestClient,
) {
    private val log = LoggerFactory.getLogger(KratosIdentityUserResolver::class.java)

    /**
     * Throws [InvalidBearerTokenException] when Hydra 401s or `/userinfo` returns no email
     * (token valid but no longer authoritative), [HydraUserinfoUnavailableException] when
     * Hydra is unreachable (→ 503).
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
            // Concurrent first-sight race: another request created the account; re-read it.
            findUserByReference(sub) ?: throw ex
        }
}

/**
 * A transient Hydra failure, not a bad token. Extends [AuthenticationException] so the
 * resource-server filter routes it to [HydraAuthenticationEntryPoint] for a 503.
 */
class HydraUserinfoUnavailableException(
    message: String,
    cause: Throwable? = null,
) : AuthenticationException(message, cause)

/** Dedicated [RestClient] with explicit timeouts so a slow Hydra cannot pin Tomcat threads. */
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
    fun displayName(): String? =
        listOfNotNull(given_name, family_name)
            .joinToString(" ")
            .ifBlank { null }
}
