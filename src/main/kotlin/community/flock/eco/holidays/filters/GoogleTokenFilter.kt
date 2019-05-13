package community.flock.eco.holidays.filters

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.web.client.RestTemplate
import org.springframework.web.filter.GenericFilterBean
import java.security.Principal
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest


class GoogleTokenFilter(
        private val userRepository: UserRepository) : GenericFilterBean() {

    data class GoogleTokenUser(
            val user: User
    ) : Principal {
        override fun getName(): String = this.user.reference
    }

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

            val user = userRepository.findByReference(email).orElseGet {
                User(
                        name = email,
                        reference = email,
                        email = email
                ).let {
                    userRepository.save(it)
                }
            }

            val authorities = user.authorities
                    .map { SimpleGrantedAuthority(it) }
                    .plus(SimpleGrantedAuthority("USER_ROLE"))

            val authToken = PreAuthenticatedAuthenticationToken(GoogleTokenUser(user), null, authorities)
            SecurityContextHolder.getContext().authentication = authToken
        }

        filterChain.doFilter(req, res)
    }
}