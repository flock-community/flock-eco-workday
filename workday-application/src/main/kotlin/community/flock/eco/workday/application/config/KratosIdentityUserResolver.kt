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
import org.springframework.context.annotation.Conditional
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.client.SimpleClientHttpRequestFactory
import org.springframework.http.converter.HttpMessageConversionException
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import org.springframework.web.client.RestClientException
import org.springframework.web.client.RestClientResponseException
import java.time.Duration
import java.util.Collections

/**
 * Resolves a Hydra-issued JWT (its `sub` claim and the bearer token) to a workday [User].
 *
 * Algorithm:
 *  1. In-memory cache lookup by `sub` → return.
 *  2. DB lookup by `kratos_identity_id` → cache + return.
 *  3. GET Hydra `/userinfo` with the inbound access_token (Bearer) → `email`.
 *  4. `userService.findByEmail(email)` →
 *      - exists: write `kratos_identity_id = sub` on the row (links the Kratos identity
 *        to the existing Google-web-flow user).
 *      - missing: create a new User with `kratos_identity_id = sub` (mirrors the
 *        existing Google-login auto-create behavior).
 *
 * Steps 3+4 happen exactly once per `sub` per backend instance: the resolved `user.code`
 * is cached so subsequent requests resolve without leaving the process. JWT signature
 * verification is handled by Spring's JwtDecoder upstream (Hydra JWKS, cached).
 *
 * Designed in flock-app/docs/adr/0003-mobile-auth-via-hydra-pkce.md (plan-W1).
 */
@Component
@Conditional(HydraIssuerConfigured::class)
class KratosIdentityUserResolver(
    private val userService: UserService,
    @Qualifier("hydraUserinfoRestClient") private val restClient: RestClient,
) {
    private val log = LoggerFactory.getLogger(KratosIdentityUserResolver::class.java)

    // Bounded LRU sized for the typical concurrent mobile fleet — caps memory in a
    // token-spray scenario, matching the bound chosen in the abandoned PR #488.
    private val subToUserCode: MutableMap<String, String> =
        Collections.synchronizedMap(
            object : LinkedHashMap<String, String>(64, 0.75f, true) {
                override fun removeEldestEntry(eldest: Map.Entry<String, String>): Boolean = size > MAX_CACHE_SIZE
            },
        )

    /**
     * Returns the workday [User] for the given JWT `sub` claim, using [accessToken] only
     * if the resolver has to fall through to Hydra's `/userinfo` endpoint (first sight).
     *
     * Throws [InvalidBearerTokenException] if Hydra 401s or `/userinfo` returns no email
     * — both indicate a token that was structurally valid but no longer authoritative.
     */
    fun resolve(sub: String, accessToken: String): User {
        subToUserCode[sub]?.let { code ->
            userService.findByCode(code)?.let { return it }
            // Cache pointed at a deleted user — drop it and fall through.
            subToUserCode.remove(sub)
        }

        userService.findByKratosIdentityId(sub)?.let {
            subToUserCode[sub] = it.code
            return it
        }

        val email = fetchEmail(accessToken)
            ?: throw InvalidBearerTokenException("Hydra /userinfo did not return an email for sub=$sub")
        val user = findOrCreateAndLink(email, sub)
        subToUserCode[sub] = user.code
        return user
    }

    private fun fetchEmail(accessToken: String): String? {
        val info =
            try {
                restClient.get()
                    .uri("/userinfo")
                    .header("Authorization", "Bearer $accessToken")
                    .retrieve()
                    .body(HydraUserinfo::class.java)
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
        return info?.email
    }

    private fun findOrCreateAndLink(email: String, sub: String): User {
        userService.findByEmail(email)?.let { existing ->
            return userService.linkKratosIdentity(existing.code, sub) ?: existing
        }
        return try {
            val created = userService.create(UserForm(name = null, email = email))
            userService.linkKratosIdentity(created.code, sub) ?: created
        } catch (ex: DataIntegrityViolationException) {
            // Concurrent first-sight race: another request created the row. Re-read and link.
            userService.findByEmail(email)?.let { userService.linkKratosIdentity(it.code, sub) ?: it }
                ?: throw ex
        }
    }

    private companion object {
        const val MAX_CACHE_SIZE = 1024
    }
}

class HydraUserinfoUnavailableException(message: String, cause: Throwable? = null) : RuntimeException(message, cause)

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
)
