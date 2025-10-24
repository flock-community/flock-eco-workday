package community.flock.eco.workday.application.exactonline.clients

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.workday.application.exactonline.model.ExactonlineRequestObject
import community.flock.eco.workday.application.exactonline.properties.ExactonlineProperties
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono

@Component
class ExactonlineAccountClient(
    exactonlineProperties: ExactonlineProperties,
) {
    val client: WebClient =
        WebClient.builder()
            .baseUrl(exactonlineProperties.requestUri)
            .build()

    fun getAccounts(requestObject: ExactonlineRequestObject): Mono<JsonNode> =
        client
            .get()
            .uri("/api/v1/${requestObject.division}/crm/Accounts")
            .header("authorization", "Bearer ${requestObject.accessToken}")
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(ObjectNode::class.java)
            .map { it.get("d").get("results") }
}
