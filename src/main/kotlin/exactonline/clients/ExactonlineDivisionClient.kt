package community.flock.eco.feature.exactonline.clients

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.model.ExactonlineDivision
import community.flock.eco.feature.exactonline.model.ExactonlineRequestObject
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient

@Component
class ExactonlineDivisionClient(
    exactonlineProperties: ExactonlineProperties,
) {
    val client: WebClient =
        WebClient.builder()
            .baseUrl(exactonlineProperties.requestUri)
            .build()

    fun getDivisionByCode(
        requestObject: ExactonlineRequestObject,
        id: Int,
    ) = client
        .get()
        .uri("/api/v1/${requestObject.division}/system/Divisions($id)")
        .header("authorization", "Bearer ${requestObject.accessToken}")
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(ObjectNode::class.java)
        .map { it.get("d") }
        .map {
            ExactonlineDivision(
                code = it.get("Code").asInt(),
                description = it.get("Description").asText(null),
            )
        }
}
