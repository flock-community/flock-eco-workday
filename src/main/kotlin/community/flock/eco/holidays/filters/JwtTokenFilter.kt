package community.flock.eco.holidays.filters

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.json.jackson2.JacksonFactory
import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.filter.GenericFilterBean
import java.util.*
import javax.servlet.FilterChain
import javax.servlet.ServletRequest
import javax.servlet.ServletResponse
import javax.servlet.http.HttpServletRequest


class JwtTokenFilter(private val userRepository: UserRepository) : GenericFilterBean() {

    // Bearer Tokens from Gmail Actions will always be issued to this authorized party.
    private val GMAIL_AUTHORIZED_PARTY = "gmail@system.gserviceaccount.com"
    private val AUDIENCE = "https://example.com"

    override fun doFilter(req: ServletRequest, res: ServletResponse, filterChain: FilterChain) {
        val request = req as HttpServletRequest
        val authorizationHeader = request.getHeader("Authorization")
        val bearerToken = authorizationHeader.replace("Bearer ", "")
        System.out.println("---------" + bearerToken)

        val transport = GoogleNetHttpTransport.newTrustedTransport()
        val jsonFactory = JacksonFactory.getDefaultInstance()
        val verifier = GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                .setAudience(Collections.singletonList(AUDIENCE))
                .build()

        val idToken = verifier.verify(bearerToken)
        if (idToken == null || !idToken.getPayload().getAuthorizedParty().equals(GMAIL_AUTHORIZED_PARTY)) {
            System.out.println("Invalid token");
            System.exit(-1);
        }


        val user = userRepository.findByReference("user").orElseGet(null)
        val authReq = UsernamePasswordAuthenticationToken(user, null)
        SecurityContextHolder.getContext().authentication = authReq
        filterChain.doFilter(req, res)
    }
}