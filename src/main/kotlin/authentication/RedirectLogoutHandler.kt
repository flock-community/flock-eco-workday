package community.flock.eco.workday.authentication

import org.springframework.security.core.Authentication
import org.springframework.security.web.authentication.logout.LogoutHandler
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse

class RedirectLogoutHandler : LogoutHandler {
    override fun logout(request: HttpServletRequest, response: HttpServletResponse, authentication: Authentication) {
        // TODO: parameterize
        response.sendRedirect("http://accounts.flock.local:30002/logout")
    }
}
