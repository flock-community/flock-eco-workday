package community.flock.eco.workday.user.filters

import community.flock.eco.workday.user.services.UserAccountService
import community.flock.eco.workday.user.services.UserSecurityService
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.GenericFilterBean

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
