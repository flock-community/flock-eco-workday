package community.flock.eco.workday.authentication

import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.workday.authentication.KratosIdentity.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.stereotype.Component
import java.io.IOException
import javax.servlet.FilterChain
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

@Component
class OathkeeperProxyAuthenticationProvider(
) : AuthenticationProvider {

    @Autowired
    lateinit var userAccountService: UserAccountService

    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication {
        val kratosIdentity = authentication.credentials as KratosIdentity?

        val account =
            kratosIdentity?.let {
                userAccountService.findUserAccountPasswordByUserEmail(it.emailAddress.value)
            }
        return if (account != null) {
            val userSecurityPassword = UserSecurityService.UserSecurityPassword(account)
            PreAuthenticatedAuthenticationToken(
                userSecurityPassword.username,
                userSecurityPassword,
                userSecurityPassword.authorities
            )
        } else {
            PreAuthenticatedAuthenticationToken(
                kratosIdentity?.emailAddress ?: "anonymous",
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
        val email = request.getHeader("X-Email")
        val userId = request.getHeader("X-User");

        if ((email == null || userId == null)) {
            throw InvalidOathkeeperProxyHeadersException("Invalid authentication headers (X-User: $userId, X-Email: $email")
        }
        val auth = KratosIdentity(
            UserId(userId),
            EmailAddress(email)
        )

        // Create a token object ot pass to Authentication Provider
        val token = PreAuthenticatedAuthenticationToken(email, auth)
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
