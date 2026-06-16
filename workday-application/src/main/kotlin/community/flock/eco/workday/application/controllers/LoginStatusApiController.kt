package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.LoginStatus
import community.flock.eco.workday.api.model.LoginStatusResponse
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.RestController

@RestController
class LoginStatusApiController : LoginStatus.Handler {
    override suspend fun loginStatus(request: LoginStatus.Request): LoginStatus.Response<*> {
        val principal = SecurityContextHolder.getContext().authentication
        val authorities =
            if (principal is AbstractAuthenticationToken) {
                principal.authorities.map { it.authority }
            } else {
                emptyList()
            }
        return LoginStatus.Response200(
            LoginStatusResponse(
                loggedIn = principal != null && principal.isAuthenticated && principal.principal != "anonymousUser",
                authorities = authorities,
            ),
        )
    }
}
