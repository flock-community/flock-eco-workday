package community.flock.eco.feature.exactonline.clients

import com.fasterxml.jackson.databind.node.ObjectNode
import community.flock.eco.feature.exactonline.model.ExactonlineRequestObject
import community.flock.eco.workday.exactonline.model.ExactonlineDocument
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentAttachment
import community.flock.eco.workday.exactonline.model.ExactonlineDocumentType
import community.flock.eco.workday.exactonline.properties.ExactonlineProperties
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import org.springframework.web.reactive.function.client.WebClient
import reactor.core.publisher.Mono
import java.util.Base64
import java.util.UUID

@Component
class ExactonlineDocumentClient(
    exactonlineProperties: ExactonlineProperties,
) {
    val client: WebClient =
        WebClient.builder()
            .baseUrl(exactonlineProperties.requestUri)
            .build()

    fun postDocument(
        requestObject: ExactonlineRequestObject,
        document: ExactonlineDocument,
    ): Mono<ExactonlineDocument> =
        client
            .post()
            .uri("/api/v1/${requestObject.division}/documents/Documents")
            .header("authorization", "Bearer ${requestObject.accessToken}")
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                Mono.just(
                    mapOf(
                        "Subject" to document.subject,
                        "Type" to document.type.id,
                    ),
                ),
                Map::class.java,
            )
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(ObjectNode::class.java)
            .map { it.get("d") }
            .map { node ->
                ExactonlineDocument(
                    id = node.get("ID").asText().let { UUID.fromString(it) },
                    subject = node.get("Subject").asText(),
                    type =
                        node.get("Type").asText(null)
                            ?.let { it.toInt() }
                            ?.let { id -> ExactonlineDocumentType.values().find { it.id == id } }
                            ?: error("Cannot find ExactonlineDocumentType"),
                )
            }

    fun postDocumentAttachment(
        requestObject: ExactonlineRequestObject,
        attachment: ExactonlineDocumentAttachment,
    ): Mono<ObjectNode> =
        client
            .post()
            .uri("/api/v1/${requestObject.division}/documents/DocumentAttachments")
            .header("authorization", "Bearer ${requestObject.accessToken}")
            .contentType(MediaType.APPLICATION_JSON)
            .body(
                Mono.just(
                    mapOf(
                        "Attachment" to Base64.getEncoder().encodeToString(attachment.attachment),
                        "Document" to attachment.document,
                        "FileName" to attachment.fileName,
                    ),
                ),
                Map::class.java,
            )
            .accept(MediaType.APPLICATION_JSON)
            .retrieve()
            .bodyToMono(ObjectNode::class.java)
}
