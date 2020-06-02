package community.flock.eco.feature.exactonline.clients;

import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.util.MultiValueMap
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.util.UriComponents
import org.springframework.web.util.UriComponentsBuilder
import java.net.URI

@Component
class ExactonlineAuthenticationClient(
    @Value("\${flock.eco.feature.exactonline.clientId}")
    val clientId: String,
    @Value("\${flock.eco.feature.exactonline.clientSecret}")
    val clientSecret: String,
    @Value("\${flock.eco.feature.exactonline.redirectUri}")
    val redirectUri: String,
    @Value("\${flock.eco.feature.exactonline.requestUri}")
    val requestUri: String
) {

    val client: WebClient = WebClient.builder()
        .baseUrl(requestUri)
        .build()

    fun token(code: String) = client
        .post()
        .uri("/api/oauth2/token")
        .bodyValue(mapOf(
            "code" to code,
            "redirect_uri" to redirectUri,
            "grant_type" to "authorization_code",
            "client_id" to clientId,
            "client_secret" to clientSecret
        ).toMultiValueMap())
        .retrieve()

    fun refresh(refreshToken: String) = client
        .post()
        .uri("/api/oauth2/token")
        .bodyValue(mapOf(
            "refresh_token" to refreshToken,
            "grant_type" to "refresh_token",
            "client_id" to clientId,
            "client_secret" to clientSecret
        ).toMultiValueMap())
        .retrieve()


}

fun Map<String, Any>.toMultiValueMap() = this
    .map{ it.key to listOf(it.value) }
    .toMap()
    .let { LinkedMultiValueMap(it) }
