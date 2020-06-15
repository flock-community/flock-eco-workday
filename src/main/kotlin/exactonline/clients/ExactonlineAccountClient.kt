package community.flock.eco.feature.exactonline.clients;

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.model.ExactonlineRequestObject
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient

@Component
class ExactonlineAccountClient(
    private val exactonlineProperties: ExactonlineProperties
) {

    val client: WebClient = WebClient.builder()
        .baseUrl(exactonlineProperties.requestUri)
        .build()

    fun getAccounts(requestObject:ExactonlineRequestObject) = client
        .get()
        .uri("/api/v1/${requestObject.division}/crm/Accounts")
        .header("authorization", "Bearer ${requestObject.accessToken}")
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(ObjectNode::class.java)
        .map { it.get("d").get("results") }
}
