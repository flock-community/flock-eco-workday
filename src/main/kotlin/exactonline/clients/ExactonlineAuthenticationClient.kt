package community.flock.eco.feature.exactonline.clients

import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.stereotype.Component
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.reactive.function.client.WebClient

@Component
class ExactonlineAuthenticationClient(
    private val exactonlineProperties: ExactonlineProperties
) {

    val client: WebClient = WebClient.builder()
        .baseUrl(exactonlineProperties.requestUri)
        .build()

    fun token(code: String) = client
        .post()
        .uri("/api/oauth2/token")
        .bodyValue(
            mapOf(
                "code" to code,
                "redirect_uri" to exactonlineProperties.redirectUri,
                "grant_type" to "authorization_code",
                "client_id" to exactonlineProperties.clientId,
                "client_secret" to exactonlineProperties.clientSecret
            ).toMultiValueMap()
        )
        .retrieve()

    fun refresh(refreshToken: String) = client
        .post()
        .uri("/api/oauth2/token")
        .bodyValue(
            mapOf(
                "refresh_token" to refreshToken,
                "grant_type" to "refresh_token",
                "client_id" to exactonlineProperties.clientId,
                "client_secret" to exactonlineProperties.clientSecret
            ).toMultiValueMap()
        )
        .retrieve()
}

private fun <K, V> Map<K, V>.toMultiValueMap(): LinkedMultiValueMap<K, V> = this
    .map { it.key to listOf(it.value) }
    .toMap()
    .let { LinkedMultiValueMap(it) }
