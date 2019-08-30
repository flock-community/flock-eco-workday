package community.flock.eco.holidays.filters

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.user.services.UserAccountService
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.web.client.RestTemplate
import org.springframework.web.filter.GenericFilterBean
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest


class GoogleTokenFilter(
        private val userAccountService: UserAccountService) : GenericFilterBean() {

    override fun doFilter(req: ServletRequest, res: ServletResponse, filterChain: FilterChain) {
        val request = req as HttpServletRequest
        val authorizationHeader = request.getHeader("Authorization")

        if (authorizationHeader != null) {
            val url = "https://www.googleapis.com/oauth2/v1/tokeninfo"
            val headers = HttpHeaders()
            headers.add("Content-Type", "application/json")
            headers.add("Authorization", authorizationHeader)

            val entity = HttpEntity<String>(headers)
            val restTemplate = RestTemplate()
            val obj = restTemplate.exchange(url, HttpMethod.GET, entity, ObjectNode::class.java)

            val email = obj.body.get("email").asText()

//            val user = userAccountService.findUserAccountOauthByReference(email)
//                    .let {
//                    it ?: userAccountService.register()
//
//                    }
//
//            }
//
//            val authorities = user.authorities
//                    .map { SimpleGrantedAuthority(it) }
//                    .plus(SimpleGrantedAuthority("USER_ROLE"))
//
//            val authToken = PreAuthenticatedAuthenticationToken(user.getPrincipal(), null, authorities)
//            SecurityContextHolder.getContext().authentication = authToken
        }

        filterChain.doFilter(req, res)
    }
}
