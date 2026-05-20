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
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientResponseException
import org.springframework.web.filter.GenericFilterBean
import java.time.Duration
import java.util.concurrent.ConcurrentHashMap

/**
 * Validates `Authorization: Bearer <kratos-session-token>` against Ory Kratos and
 * resolves the identity to a workday [User]. See `docs/adr/0001-mobile-auth-via-kratos-session-introspection.md`.
 *
 * Per-token results are cached for [CACHE_TTL] to avoid hammering Kratos; this is a
 * performance optimisation, not a session lifetime — Kratos remains the source of truth.
 */
@Component
class KratosSessionFilter(
    private val userService: UserService,
    restClientBuilder: RestClient.Builder,
    @Value("\${flock.eco.workday.kratos.url:https://auth.flock.community}")
    private val kratosUrl: String,
) : GenericFilterBean() {
    private val log = LoggerFactory.getLogger(KratosSessionFilter::class.java)

    private val restClient: RestClient =
        restClientBuilder
            .baseUrl(kratosUrl)
            .build()

    private val cache = ConcurrentHashMap<String, CachedIdentity>()

    override fun doFilter(
        request: ServletRequest,
        response: ServletResponse,
        filterChain: FilterChain,
    ) {
        val token = extractBearerToken(request as HttpServletRequest)
        if (token == null) {
            filterChain.doFilter(request, response)
            return
        }

        val outcome =
            try {
                resolveIdentity(token)
            } catch (ex: KratosUnreachableException) {
                log.warn("Kratos unreachable while validating session token", ex)
                (response as HttpServletResponse).sendError(
                    HttpStatus.SERVICE_UNAVAILABLE.value(),
                    "Authentication service unavailable",
                )
                return
            }

        when (outcome) {
            is Outcome.Authenticated -> {
                val user = outcome.user
                val auth =
                    UsernamePasswordAuthenticationToken(
                        user.code,
                        null,
                        user.authorities.map { SimpleGrantedAuthority(it) },
                    )
                SecurityContextHolder.getContext().authentication = auth
                filterChain.doFilter(request, response)
            }
            Outcome.Invalid -> {
                // Leave SecurityContext untouched; Spring Security will respond 401 on protected paths.
                filterChain.doFilter(request, response)
            }
        }
    }

    private fun extractBearerToken(request: HttpServletRequest): String? {
        val header = request.getHeader("Authorization") ?: return null
        val match = BEARER_REGEX.find(header) ?: return null
        return match.groupValues[1].trim().ifBlank { null }
    }

    private fun resolveIdentity(token: String): Outcome {
        val now = System.nanoTime()
        cache[token]?.let { cached ->
            if (cached.expiresAtNanos > now) return Outcome.Authenticated(cached.user)
            cache.remove(token, cached)
        }

        val whoami =
            try {
                restClient.get()
                    .uri("/sessions/whoami")
                    .header("X-Session-Token", token)
                    .retrieve()
                    .body(KratosSession::class.java)
            } catch (ex: RestClientResponseException) {
                if (ex.statusCode == HttpStatus.UNAUTHORIZED || ex.statusCode == HttpStatus.FORBIDDEN) {
                    return Outcome.Invalid
                }
                throw KratosUnreachableException("Kratos returned ${ex.statusCode}", ex)
            } catch (ex: Exception) {
                throw KratosUnreachableException("Kratos call failed", ex)
            }

        val email =
            whoami?.identity?.traits?.email?.lowercase()
                ?: return Outcome.Invalid

        val user = findOrCreateUser(email, whoami.identity.traits.name)
        cache[token] = CachedIdentity(user, now + CACHE_TTL.toNanos())
        return Outcome.Authenticated(user)
    }

    /**
     * Race-safe: on unique-email constraint violation, fall back to a read — another
     * concurrent request created the row.
     */
    private fun findOrCreateUser(
        email: String,
        name: String?,
    ): User {
        userService.findByEmail(email)?.let { return it }
        return try {
            userService.create(UserForm(name = name, email = email))
        } catch (ex: DataIntegrityViolationException) {
            userService.findByEmail(email)
                ?: throw ex
        }
    }

    private sealed interface Outcome {
        data class Authenticated(val user: User) : Outcome

        data object Invalid : Outcome
    }

    private data class CachedIdentity(val user: User, val expiresAtNanos: Long)

    private class KratosUnreachableException(message: String, cause: Throwable?) : RuntimeException(message, cause)

    companion object {
        private val BEARER_REGEX = Regex("(?i)^Bearer\\s+(.+)$")
        private val CACHE_TTL: Duration = Duration.ofSeconds(60)
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class KratosSession(val identity: KratosIdentity?)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class KratosIdentity(val traits: KratosTraits?)

@JsonIgnoreProperties(ignoreUnknown = true)
internal data class KratosTraits(val email: String?, val name: String?)
