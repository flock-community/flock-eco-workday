package community.flock.eco.feature.exactonline.clients

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.model.ExactonlineUser
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.util.UUID

@Component
class ExactonlineUserClient(
    exactonlineProperties: ExactonlineProperties,
) {
    val client: WebClient =
        WebClient.builder()
            .baseUrl(exactonlineProperties.requestUri)
            .build()

    fun getCurrentMe(accessToken: String): Mono<ExactonlineUser> =
        client
            .get()
            .uri("/api/v1/current/Me")
            .header("authorization", "Bearer $accessToken")
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(ObjectNode::class.java)
            .map { it.get("d").get("results").first() }
            .map {
                ExactonlineUser(
                    id = it.get("UserID").textValue().let { UUID.fromString(it) },
                    name = it.get("UserName").asText(null),
                    fullName = it.get("FullName").asText(null),
                    email = it.get("Email").asText(null),
                    title = it.get("Title").asText(null),
                    initials = it.get("Initials").asText(null),
                    firstName = it.get("FirstName").asText(null),
                    middleName = it.get("MiddleName").asText(null),
                    lastName = it.get("LastName").asText(null),
                    employeeId = it.get("EmployeeID").asText().let { UUID.fromString(it) },
                    divisionCustomer = it.get("DivisionCustomer").textValue().let { UUID.fromString(it) },
                    currentDivision = it.get("CurrentDivision").intValue(),
                )
            }
}
