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
import org.springframework.dao.DataIntegrityViolationException
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

@Component
@Conditional(HydraIssuerConfigured::class)
class KratosIdentityUserResolver(
    private val userAccountService: UserAccountService,
    @Qualifier("hydraUserinfoRestClient") private val restClient: RestClient,
) {
    private val log = LoggerFactory.getLogger(KratosIdentityUserResolver::class.java)

    fun resolve(
        sub: String,
        accessToken: String,
    ): User {
        findExistingUserBySub(sub)?.let { return it }

        val info = fetchUserinfo(accessToken)
        val email =
            info.email
                ?: throw InvalidBearerTokenException("Hydra /userinfo did not return an email for sub=$sub")
        return findOrCreateAccount(sub, email, info.displayName())
    }

    private fun findExistingUserBySub(sub: String): User? = userAccountService.findUserAccountOauthByReference(sub)?.user

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

    // Both catches re-read the winner of a find-or-create race. The DataIntegrityViolationException one
    // depends on resolve() running outside a transaction: this @Transactional create must be the outermost
    // tx so the unique-constraint violation flushes at its own commit and is caught here. An enclosing tx
    // would defer the throw past these catches and 500 the request.
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
            findExistingUserBySub(sub) ?: throw ex
        } catch (ex: DataIntegrityViolationException) {
            findExistingUserBySub(sub) ?: throw ex
        }
}

// Extends AuthenticationException so the resource-server filter routes it through
// HydraAuthenticationEntryPoint (→ 503) rather than treating it as a bad token (401).
class HydraUserinfoUnavailableException(
    message: String,
    cause: Throwable? = null,
) : AuthenticationException(message, cause)

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
