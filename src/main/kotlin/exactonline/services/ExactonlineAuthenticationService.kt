package community.flock.eco.workday.exactonline.services

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.clients.ExactonlineAuthenticationClient
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponents
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Mono
import java.net.URI
import java.time.LocalDateTime
import javax.servlet.http.HttpSession

data class StoreObject(
    val token: ObjectNode,
    val timestamp: LocalDateTime
)

@Service
class ExactonlineAuthenticationService(
    private val authenticationClient: ExactonlineAuthenticationClient,
    private val exactonlineProperties: ExactonlineProperties
) {

    val sessionKeyToken = "EXACTONLINE_TOKEN"
    val sessionKeyRedirect = "EXACTONLINE_REDIRECT"

    fun authorizationUrl(): UriComponents = UriComponentsBuilder
        .fromUriString(exactonlineProperties.requestUri)
        .path("/api/oauth2/auth")
        .queryParam("client_id", exactonlineProperties.clientId)
        .queryParam("redirect_uri", exactonlineProperties.redirectUri)
        .queryParam("response_type", "code")
        .queryParam("force_login", 0)
        .build()

    fun accessToken(session: HttpSession): Mono<String> {
        val store = session.getAttribute(sessionKeyToken) as StoreObject?
        if (store != null) {
            val expiresIn = store.token.get("expires_in").asLong() - 10
            if (LocalDateTime.now().isAfter(store.timestamp.plusSeconds(10))) {
                val refreshToken = store.token.get("refresh_token").asText()
                return authenticationClient.refresh(refreshToken)
                    .bodyToMono(ObjectNode::class.java)
                    .map { storeObject(session, it) }
                    .map { it.token.get("access_token").textValue() }
            }
            return store.token
                .get("access_token")
                .let { Mono.just(it.textValue()) }
        }
        return Mono.empty()
    }

    private fun storeObject(session: HttpSession, body: ObjectNode) = StoreObject(
        token = body,
        timestamp = LocalDateTime.now()
    ).apply {
        session.setAttribute(sessionKeyToken, this)
    }

    fun authenticate(session: HttpSession, code: String): Mono<StoreObject> = authenticationClient
        .token(code)
        .bodyToMono(ObjectNode::class.java)
        .map { storeObject(session, it) }


    fun getRedirectUri(session: HttpSession) = session
        .getAttribute(sessionKeyRedirect) as URI?

    fun storeRedirectUri(session: HttpSession, uri: URI) = session
        .setAttribute(sessionKeyRedirect, uri)

}
