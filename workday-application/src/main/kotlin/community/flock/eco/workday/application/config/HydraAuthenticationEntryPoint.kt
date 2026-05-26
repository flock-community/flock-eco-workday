package community.flock.eco.workday.application.config

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Conditional
import org.springframework.security.core.AuthenticationException
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component

/**
 * A [HydraUserinfoUnavailableException] is a transient upstream failure → 503 (retry later),
 * not 401. Everything else falls through to the standard Bearer-token 401 response.
 */
@Component
@Conditional(HydraIssuerConfigured::class)
class HydraAuthenticationEntryPoint : AuthenticationEntryPoint {
    private val delegate = BearerTokenAuthenticationEntryPoint()

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException,
    ) {
        if (authException.hasCauseOfType<HydraUserinfoUnavailableException>()) {
            response.sendError(
                HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                "Identity provider temporarily unavailable",
            )
            return
        }
        delegate.commence(request, response, authException)
    }
}

private inline fun <reified T : Throwable> Throwable.hasCauseOfType(): Boolean {
    var current: Throwable? = this
    while (current != null) {
        if (current is T) return true
        current = current.cause
    }
    return false
}
