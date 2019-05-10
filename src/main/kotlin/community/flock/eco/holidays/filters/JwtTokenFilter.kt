package community.flock.eco.holidays.filters

import org.springframework.security.core.context.SecurityContextHolder
import javax.servlet.http.HttpServletRequest
import com.sun.xml.internal.ws.policy.sourcemodel.wspolicy.XmlToken.resolveToken
import javax.servlet.ServletException
import java.io.IOException
import javax.servlet.FilterChain
import javax.servlet.ServletResponse
import javax.servlet.ServletRequest
import org.springframework.web.filter.GenericFilterBean
import javax.servlet.http.HttpServletResponse




class JwtTokenFilter : GenericFilterBean() {

    override fun doFilter(req: ServletRequest, res: ServletResponse, filterChain: FilterChain) {
        val request = req as HttpServletRequest
        val authHeader = request.getHeader("Authorization")
        System.out.println("---------" + authHeader)
        filterChain.doFilter(req, res)
    }
}