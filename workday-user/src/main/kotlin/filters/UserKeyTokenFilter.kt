package community.flock.eco.feature.user.filters

import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserSecurityService
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.GenericFilterBean
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest

@Component
class UserKeyTokenFilter(
    val userAccountService: UserAccountService,
) : GenericFilterBean() {
    override fun doFilter(
        request: ServletRequest,
        response: ServletResponse,
        filterChain: FilterChain,
    ) {
        val token = (request as HttpServletRequest).getHeader("Authorization")
        val key =
            token?.let {
                "TOKEN (.*)".toRegex().find(it)?.groups?.get(1)?.value
            }
        if (key != null) {
            userAccountService.findUserAccountKeyByKey(key)
                ?.also { account ->
                    val user = UserSecurityService.UserSecurityKey(account)
                    val auth = UsernamePasswordAuthenticationToken(user, null, user.authorities)
                    SecurityContextHolder.getContext().authentication = auth
                }
        }
        filterChain.doFilter(request, response)
    }
}
