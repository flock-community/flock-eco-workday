package community.flock.eco.holidays.filters

import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.GenericFilterBean
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.apache.http.impl.auth.BasicScheme.authenticate




class JwtTokenFilter(private val userRepository: UserRepository) : GenericFilterBean() {

    override fun doFilter(req: ServletRequest, res: ServletResponse, filterChain: FilterChain) {
        val request = req as HttpServletRequest
        val authHeader = request.getHeader("Authorization")
        System.out.println("---------" + authHeader)
        val user = userRepository.findByReference("user").orElseGet(null)
        val authReq = UsernamePasswordAuthenticationToken(user, null)
        SecurityContextHolder.getContext().authentication = authReq
        filterChain.doFilter(req, res)
    }
}