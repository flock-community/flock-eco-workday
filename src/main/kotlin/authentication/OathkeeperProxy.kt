package community.flock.eco.workday.authentication

import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.stereotype.Component
import java.io.IOException
import java.time.Instant
import javax.servlet.FilterChain
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class OathkeeperProxyAuthenticationProvider(
    private val userAccountService: UserAccountService
) : AuthenticationProvider {

    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication {
        val kratosIdentity = authentication.credentials as KratosUserId?
        val account = kratosIdentity?.let { userAccountService.findUserAccountOauthByReference(it.value) }
        return if (account != null) {
            val userSecurityOauth2 = UserSecurityService.UserSecurityOauth2(
                account, OidcIdToken(
                    "token-value",
                    Instant.EPOCH, Instant.MAX,
                    mapOf(
                        Pair("sub", account.reference),
                        Pair("name", account.user.name ?: "anon"),
                        Pair("email", account.user.email),
                        Pair("kratos_user_id", kratosIdentity.value)
                    )
                )
            )
            PreAuthenticatedAuthenticationToken(
                userSecurityOauth2.account.user.code,
                userSecurityOauth2,
                userSecurityOauth2.authorities
            )
        } else {
            PreAuthenticatedAuthenticationToken(
                kratosIdentity?.value ?: "anonymous",
                null
            )
        }
    }

    override fun supports(authentication: Class<*>): Boolean {
        // Let's use inbuilt token class for simplicity
        return PreAuthenticatedAuthenticationToken::class.java == authentication
    }
}

class OathkeeperProxyAuthenticationProcessingFilter(
    requiresAuthenticationRequestMatcher: RequestMatcher,
    authenticationManager: AuthenticationManager
) : AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {
    init {
        //Set authentication manager
        setAuthenticationManager(authenticationManager)
    }

    @Throws(AuthenticationException::class, IOException::class, ServletException::class)
    override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication {
        // Extract from request
        val userId = request.getHeader("X-User")
            ?: throw InvalidOathkeeperProxyHeadersException("Invalid authentication headers (X-User)")

        // Create a token object ot pass to Authentication Provider
        val token = PreAuthenticatedAuthenticationToken(userId, KratosUserId(userId))
        return authenticationManager.authenticate(token)
    }

    @Throws(IOException::class, ServletException::class)
    override fun successfulAuthentication(
        request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain,
        authResult: Authentication
    ) {
        // Save user principle in security context
        SecurityContextHolder.getContext().authentication = authResult
        chain.doFilter(request, response)
    }
}


class InvalidOathkeeperProxyHeadersException(message: String) : AuthenticationException(message)
