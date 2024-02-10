package community.flock.eco.workday.filters

import org.springframework.http.HttpHeaders
import org.springframework.web.filter.GenericFilterBean
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest

class GoogleTokenFilter : GenericFilterBean() {
    override fun doFilter(
        req: ServletRequest,
        res: ServletResponse,
        filterChain: FilterChain,
    ) {
        val request = req as HttpServletRequest
        val authorizationHeader = request.getHeader("Authorization")

        if (authorizationHeader != null) {
            val headers = HttpHeaders()
            headers.add("Content-Type", "application/json")
            headers.add("Authorization", authorizationHeader)
        }

        filterChain.doFilter(req, res)
    }
}
