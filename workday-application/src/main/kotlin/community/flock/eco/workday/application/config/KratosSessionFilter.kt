package community.flock.eco.workday.application.config

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.services.UserService
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.http.converter.HttpMessageConversionException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestClientResponseException
import org.springframework.web.filter.GenericFilterBean
import java.time.Duration
import java.util.Collections

/**
 * Validates `Authorization: Bearer <kratos-session-token>` against Ory Kratos and
 * resolves the identity to a workday [User]. See `docs/adr/0001-mobile-auth-via-kratos-session-introspection.md`.
 *
 * Per-token outcomes are cached to avoid hammering Kratos. Positive outcomes live
 * [CACHE_TTL_OK]; negative outcomes live [CACHE_TTL_BAD] — short enough that a token
 * which just became valid recovers quickly, long enough to absorb a spray of garbage
 * tokens without per-request Kratos calls. Kratos remains the source of truth.
 */
@Component
class KratosSessionFilter(
    private val userService: UserService,
    @Qualifier("kratosRestClient") private val restClient: RestClient,
) : GenericFilterBean() {
    private val log = LoggerFactory.getLogger(KratosSessionFilter::class.java)

    // Bounded LRU (least-recently-used): caps memory under a token-spray attack. Sized for typical fleet
    // (< MAX_CACHE_SIZE concurrent active mobile sessions).
    private val tokenCache: MutableMap<String, CachedOutcome> =
        Collections.synchronizedMap(
            object : LinkedHashMap<String, CachedOutcome>(64, 0.75f, true) {
                override fun removeEldestEntry(eldest: Map.Entry<String, CachedOutcome>): Boolean = size > MAX_CACHE_SIZE
            },
        )

    override fun doFilter(
        request: ServletRequest,
        response: ServletResponse,
        filterChain: FilterChain,
    ) {
        val httpRequest = request as HttpServletRequest
        val httpResponse = response as HttpServletResponse
        val token = httpRequest.bearerToken()

        if (token == null) {
            filterChain.doFilter(request, response)
            return
        }

        val outcome =
            try {
                resolveIdentity(token)
            } catch (ex: KratosUnreachableException) {
                log.warn("Kratos unreachable while validating session token", ex)
                httpResponse.sendError(HttpStatus.SERVICE_UNAVAILABLE.value(), "Authentication service unavailable")
                return
            }

        if (outcome is Outcome.Authenticated) {
            SecurityContextHolder.getContext().authentication = outcome.toAuthentication()
        }
        // Outcome.Invalid leaves SecurityContext untouched; Spring Security replies 401 on protected paths.
        filterChain.doFilter(request, response)
    }

    private fun HttpServletRequest.bearerToken(): String? =
        getHeader("Authorization")
            ?.let { BEARER_REGEX.matchEntire(it) }
            ?.groupValues?.get(1)
            ?.trim()
            ?.ifBlank { null }

    private fun Outcome.Authenticated.toAuthentication(): UsernamePasswordAuthenticationToken =
        UsernamePasswordAuthenticationToken(
            user.code,
            null,
            user.authorities.map { SimpleGrantedAuthority(it) },
        )

    private fun resolveIdentity(token: String): Outcome {
        tokenCache[token]
            ?.takeIf { it.expiresAtNanos > System.nanoTime() }
            ?.let { return it.outcome }

        return fetchOutcome(token).also { remember(token, it) }
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
                    else -> throw KratosUnreachableException("Kratos returned ${ex.statusCode}", ex)
                }
            } catch (ex: RestClientException) {
                throw KratosUnreachableException("Kratos call failed", ex)
            } catch (ex: HttpMessageConversionException) {
                throw KratosUnreachableException("Kratos returned an unparseable response", ex)
            }

        // Email case-normalization is owned by UserService.findByEmail (case-insensitive
        // lookup). Pass Kratos's email through as-given, matching the legacy googleLogin path.
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

    /**
     * Race-safe: on unique-email constraint violation, fall back to a read — another
     * concurrent request created the row.
     */
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

    private sealed interface Outcome {
        data class Authenticated(val user: User) : Outcome

        data object Invalid : Outcome
    }

    private data class CachedOutcome(val outcome: Outcome, val expiresAtNanos: Long)

    private class KratosUnreachableException(message: String, cause: Throwable?) : RuntimeException(message, cause)

    companion object {
        private val BEARER_REGEX = Regex("(?i)Bearer\\s+(.+)")
        private val CACHE_TTL_OK: Duration = Duration.ofSeconds(60)
        private val CACHE_TTL_BAD: Duration = Duration.ofSeconds(10)
        private const val MAX_CACHE_SIZE = 1024
    }
}

/**
 * Dedicated [RestClient] for [KratosSessionFilter]. Explicit connect/read timeouts so a slow or
 * stalled Kratos cannot pin Tomcat threads — the filter's 503 fast-fail relies on this.
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
