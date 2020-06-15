package community.flock.eco.workday.exactonline.services

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.clients.ExactonlineAuthenticationClient
import community.flock.eco.feature.exactonline.clients.ExactonlineUserClient
import community.flock.eco.feature.exactonline.model.ExactonlineRequestObject
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.stereotype.Service
import org.springframework.web.util.UriComponents
import org.springframework.web.util.UriComponentsBuilder
import reactor.core.publisher.Mono
import java.net.URI
import java.time.LocalDateTime
import javax.servlet.http.HttpSession

data class StoreObject(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long,
    val division: Int,
    val timestamp: LocalDateTime
)

@Service
class ExactonlineAuthenticationService(
    private val authenticationClient: ExactonlineAuthenticationClient,
    private val userClient: ExactonlineUserClient,
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

    fun accessToken(session: HttpSession): Mono<ExactonlineRequestObject> {
        val store = session.getAttribute(sessionKeyToken) as StoreObject?
        if (store != null) {
            val expiresIn = store.expiresIn - 10
            if (LocalDateTime.now().isAfter(store.timestamp.plusSeconds(expiresIn))) {
                return authenticationClient.refresh(store.refreshToken)
                    .bodyToMono(ObjectNode::class.java)
                    .flatMap { storeObject(session, it) }
                    .map { ExactonlineRequestObject(it.accessToken, it.division) }
            }
            return Mono.just(store)
                .map { ExactonlineRequestObject(it.accessToken, it.division) }
        }
        return Mono.empty()
    }

    private fun storeObject(session: HttpSession, body: ObjectNode):Mono<StoreObject> {
        val accessToken = body.get("access_token").asText()
        return userClient.getCurrentMe(accessToken)
            .map {
                StoreObject(
                    accessToken = accessToken,
                    refreshToken = body.get("refresh_token").asText(),
                    expiresIn = body.get("expires_in").asLong(),
                    division = it.currentDivision,
                    timestamp = LocalDateTime.now()
                )
            }
            .doOnNext {
                session.setAttribute(sessionKeyToken, it)
            }


    }

    fun authenticate(session: HttpSession, code: String): Mono<StoreObject> = authenticationClient
        .token(code)
        .bodyToMono(ObjectNode::class.java)
        .flatMap { storeObject (session, it) }


    fun getRedirectUri(session: HttpSession) = session
        .getAttribute(sessionKeyRedirect) as URI?

    fun storeRedirectUri(session: HttpSession, uri: URI) = session
        .setAttribute(sessionKeyRedirect, uri)

}
