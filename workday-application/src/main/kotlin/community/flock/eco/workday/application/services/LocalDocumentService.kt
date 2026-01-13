package community.flock.eco.workday.application.services

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Service
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.UUID

@Service
@ConditionalOnProperty(name = ["flock.eco.workday.google.enabled"], havingValue = "false", matchIfMissing = false)
class LocalDocumentService : DocumentStorage {
    companion object {
        const val DOCUMENTS_PATH = "database/documents"
        var logger: Logger = LoggerFactory.getLogger(LocalDocumentService::class.java)
    }

    init {
        // Ensure the documents directory exists
        logger.warn("⚠️⚠️ Using local file storage for documents")
        val documentsDir = File(DOCUMENTS_PATH)
        if (!documentsDir.exists()) {
            documentsDir.mkdirs()
            logger.info("Created documents directory at: $DOCUMENTS_PATH")
        }
    }

    override fun storeDocument(byteArray: ByteArray): UUID {
        val uuid = UUID.randomUUID()
        val filePath = Paths.get(DOCUMENTS_PATH, uuid.toString())

        logger.info("Store document locally at: $filePath")
        Files.write(filePath, byteArray)

        return uuid
    }

    override fun readDocument(uuid: UUID): ByteArray {
        val filePath = Paths.get(DOCUMENTS_PATH, uuid.toString())

        logger.info("Read document from local path: $filePath")
        if (!Files.exists(filePath)) {
            throw IllegalArgumentException("Document not found: $uuid")
        }

        return Files.readAllBytes(filePath)
    }
}
