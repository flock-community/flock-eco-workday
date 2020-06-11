package community.flock.eco.feature.exactonline.clients;

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.model.ExactonlineUser
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import java.util.UUID

@Component
class ExactonlineInvoiceClient(
    private val exactonlineProperties: ExactonlineProperties
) {

    val client: WebClient = WebClient.builder()
        .baseUrl(exactonlineProperties.requestUri)
        .build()


}
