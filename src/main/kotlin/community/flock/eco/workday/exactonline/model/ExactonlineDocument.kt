package community.flock.eco.workday.exactonline.model

import java.util.UUID

data class ExactonlineDocument(
    val id: UUID? = null,
    val subject: String,
    val type: ExactonlineDocumentType,
)

enum class ExactonlineDocumentType(val id: Int) {
    SALES(10),
    PURCHASE(20),
}

class ExactonlineDocumentAttachment(
    val id: UUID? = null,
    val attachment: ByteArray,
    val document: UUID,
    val fileName: String,
)
