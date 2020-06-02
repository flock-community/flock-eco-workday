package community.flock.eco.feature.exactonline.clients;

import com.fasterxml.jackson.databind.node.ObjectNode
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient

@Component
class ExactonlineAccountClient(
    @Value("\${flock.eco.feature.exactonline.requestUri}")
    private val requestUri: String
) {

    val client: WebClient = WebClient.builder()
        .baseUrl(requestUri)
        .build()

    fun getAccounts(accessToken:String, division:Int) = client
        .get()
        .uri("/api/v1/$division/crm/Accounts")
        .header("authorization", "Bearer $accessToken")
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(ObjectNode::class.java)
        .map { it.get("d").get("results") }
}
