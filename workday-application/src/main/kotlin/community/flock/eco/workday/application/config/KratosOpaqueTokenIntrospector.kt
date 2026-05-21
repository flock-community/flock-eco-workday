package community.flock.eco.workday.application.config

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.http.converter.HttpMessageConversionException
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionAuthenticatedPrincipal
import org.springframework.security.oauth2.server.resource.introspection.OAuth2IntrospectionException
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestClientResponseException
import java.time.Duration
import java.util.Collections

/**
 * Validates an opaque Kratos session token against `auth.flock.community/sessions/whoami` and
 * resolves the identity to a workday [User]. Plugged into Spring Security via
 * `oauth2ResourceServer().opaqueToken().introspector(...)` — see [WebSecurityConfig].
 *
 * Kratos's `/sessions/whoami` is *not* RFC 7662; this introspector adapts the Kratos shape to
 * Spring Security's [OAuth2AuthenticatedPrincipal] so the standard `BearerTokenAuthenticationFilter`
 * can drive header parsing, 401 + `WWW-Authenticate` responses, and SecurityContext population.
 *
 * Per-token outcomes are cached to absorb token-spray without hammering Kratos. Positive outcomes
 * live [CACHE_TTL_OK]; negative outcomes live [CACHE_TTL_BAD] — long enough to absorb garbage
 * sprays, short enough that a newly-valid token recovers quickly. Kratos remains source of truth.
 *
 * See `docs/adr/0001-mobile-auth-via-kratos-session-introspection.md`.
 */
@Component
class KratosOpaqueTokenIntrospector(
    private val userService: UserService,
    @Qualifier("kratosRestClient") private val restClient: RestClient,
) : OpaqueTokenIntrospector {
    private val log = LoggerFactory.getLogger(KratosOpaqueTokenIntrospector::class.java)

    // Bounded LRU caps memory under a token-spray attack. Sized for typical fleet (<MAX_CACHE_SIZE
    // concurrent active mobile sessions).
    private val tokenCache: MutableMap<String, CachedOutcome> =
        Collections.synchronizedMap(
            object : LinkedHashMap<String, CachedOutcome>(64, 0.75f, true) {
                override fun removeEldestEntry(eldest: Map.Entry<String, CachedOutcome>): Boolean = size > MAX_CACHE_SIZE
            },
        )

    override fun introspect(token: String): OAuth2AuthenticatedPrincipal {
        val outcome = tokenCache[token]?.takeIf { it.expiresAtNanos > System.nanoTime() }?.outcome
            ?: fetchOutcome(token).also { remember(token, it) }
        return when (outcome) {
            is Outcome.Authenticated -> outcome.toPrincipal()
            Outcome.Invalid -> throw BadOpaqueTokenException("Kratos rejected session token")
        }
    }

    private fun fetchOutcome(token: String): Outcome {
        val session =
            try {
                restClient.get()
                    .uri("/sessions/whoami")
                    .header("X-Session-Token", token)
                    .retrieve()
                    .body(KratosSession::class.java)
            } catch (ex: RestClientResponseException) {
                return when (ex.statusCode) {
                    HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN -> Outcome.Invalid
                    else -> {
                        log.warn("Kratos returned {} while validating session token", ex.statusCode)
                        throw OAuth2IntrospectionException("Kratos returned ${ex.statusCode}", ex)
                    }
                }
            } catch (ex: RestClientException) {
                log.warn("Kratos call failed while validating session token", ex)
                throw OAuth2IntrospectionException("Kratos call failed", ex)
            } catch (ex: HttpMessageConversionException) {
                log.warn("Kratos returned an unparseable response", ex)
                throw OAuth2IntrospectionException("Kratos returned an unparseable response", ex)
            }

        // Email case-normalization is owned by UserService.findByEmail (case-insensitive lookup).
        // Pass Kratos's email through as-given, matching the legacy googleLogin path.
        val traits = session?.identity?.traits ?: return Outcome.Invalid
        val email = traits.email ?: return Outcome.Invalid
        return Outcome.Authenticated(findOrCreateUser(email, traits.name))
    }

    private fun remember(
        token: String,
        outcome: Outcome,
    ) {
        val ttl =
            when (outcome) {
                is Outcome.Authenticated -> CACHE_TTL_OK
                Outcome.Invalid -> CACHE_TTL_BAD
            }
        tokenCache[token] = CachedOutcome(outcome, System.nanoTime() + ttl.toNanos())
    }

    // Race-safe: on unique-email constraint violation, fall back to a read — another concurrent
    // request created the row.
    private fun findOrCreateUser(
        email: String,
        name: String?,
    ): User =
        userService.findByEmail(email)
            ?: try {
                userService.create(UserForm(name = name, email = email))
            } catch (ex: DataIntegrityViolationException) {
                userService.findByEmail(email) ?: throw ex
            }

    // name = user.code so downstream `authentication.name` keeps matching personService.findByUserCode,
    // mirroring the legacy UserKeyTokenFilter / googleLogin contract. Attributes must be non-empty
    // per OAuth2IntrospectionAuthenticatedPrincipal's contract; "sub" suffices.
    private fun Outcome.Authenticated.toPrincipal(): OAuth2AuthenticatedPrincipal =
        OAuth2IntrospectionAuthenticatedPrincipal(
            user.code,
            mapOf("sub" to user.code),
            user.authorities.map { SimpleGrantedAuthority(it) },
        )

    private sealed interface Outcome {
        data class Authenticated(val user: User) : Outcome

        data object Invalid : Outcome
    }

    private data class CachedOutcome(val outcome: Outcome, val expiresAtNanos: Long)

    companion object {
        private val CACHE_TTL_OK: Duration = Duration.ofSeconds(60)
        private val CACHE_TTL_BAD: Duration = Duration.ofSeconds(10)
        private const val MAX_CACHE_SIZE = 1024
    }
}

/**
 * Dedicated [RestClient] for [KratosOpaqueTokenIntrospector]. Explicit connect/read timeouts so a
 * slow or stalled Kratos cannot pin Tomcat threads.
 */
@Configuration
class KratosRestClientConfig {
    @Bean("kratosRestClient")
    fun kratosRestClient(
        builder: RestClient.Builder,
        @Value("\${flock.eco.workday.kratos.url:https://auth.flock.community}")
        kratosUrl: String,
    ): RestClient =
        builder
            .baseUrl(kratosUrl)
            .requestFactory(
                SimpleClientHttpRequestFactory().apply {
                    setConnectTimeout(Duration.ofSeconds(2))
                    setReadTimeout(Duration.ofSeconds(3))
                },
            ).build()
}

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class KratosSession(val identity: KratosIdentity?)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class KratosIdentity(val traits: KratosTraits?)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class KratosTraits(val email: String?, val name: String?)
