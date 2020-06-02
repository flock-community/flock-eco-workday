package community.flock.eco.feature.exactonline.clients;

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.model.ExactonlineUser
import community.flock.eco.workday.exactonline.model.ExactonlineDocument
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentAttachment
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentType
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.util.Base64
import java.util.UUID

@Component
class ExactonlineDocumentClient(
    @Value("\${flock.eco.feature.exactonline.requestUri}")
    private val requestUri: String
) {

    val client: WebClient = WebClient.builder()
        .baseUrl(requestUri)
        .build()

    fun postDocument(accessToken:String, division:Int, document: ExactonlineDocument): Mono<ExactonlineDocument> = client
        .post()
        .uri("/api/v1/$division/documents/Documents")
        .header("authorization", "Bearer $accessToken")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Mono.just(mapOf(
            "Subject" to document.subject,
            "Type" to document.type.id
        )), Map::class.java)
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(ObjectNode::class.java)
        .map { it.get("d") }
        .map { document -> ExactonlineDocument(
            id = document.get("ID").asText().let { UUID.fromString(it) },
            subject = document.get("Subject").asText(),
            type = document.get("Type").asText(null)
                ?.let{ it.toInt()}
                ?.let { id -> ExactonlineDocumentType.values().find { it.id == id } }
                ?:error("Cannot find ExactonlineDocumentType")
        ) }

    fun postDocumentAttachment(accessToken:String, division:Int, attachment: ExactonlineDocumentAttachment) = client
        .post()
        .uri("/api/v1/$division/documents/DocumentAttachments")
        .header("authorization", "Bearer $accessToken")
        .contentType(MediaType.APPLICATION_JSON)
        .body(Mono.just(mapOf(
            "Attachment" to Base64.getEncoder().encodeToString(attachment.attachment),
            "Document" to attachment.document,
            "FileName" to attachment.fileName
        )), Map::class.java)
        .accept(MediaType.APPLICATION_JSON)
        .retrieve()
        .bodyToMono(ObjectNode::class.java)
}
