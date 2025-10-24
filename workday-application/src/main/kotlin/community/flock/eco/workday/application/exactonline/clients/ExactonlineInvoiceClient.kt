package community.flock.eco.workday.application.exactonline.clients

import community.flock.eco.workday.application.exactonline.properties.ExactonlineProperties
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient

@Component
class ExactonlineInvoiceClient(
    exactonlineProperties: ExactonlineProperties,
) {
    val client: WebClient =
        WebClient.builder()
            .baseUrl(exactonlineProperties.requestUri)
            .build()
}
