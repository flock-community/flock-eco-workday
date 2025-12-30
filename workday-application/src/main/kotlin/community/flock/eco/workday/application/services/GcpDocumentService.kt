package community.flock.eco.workday.application.services

import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.google.cloud.storage.StorageOptions
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Service
import java.util.UUID

@Service
@ConditionalOnProperty(name = ["flock.eco.workday.google.enabled"], havingValue = "true")
class GcpDocumentService(
    @Value("\${flock.eco.workday.bucket.documents}") val bucketName: String,
) : DocumentStorage {
    companion object {
        val storage: Storage = StorageOptions.getDefaultInstance().service
        var logger: Logger = LoggerFactory.getLogger(GcpDocumentService::class.java)
    }

    override fun storeDocument(byteArray: ByteArray): UUID {
        logger.debug("Store document to GCP bucket: $bucketName")
        return UUID.randomUUID()
            .apply {
                BlobInfo
                    .newBuilder(bucketName, toString())
                    .build()
                    .apply {
                        storage.create(this, byteArray)
                    }
            }
    }

    override fun readDocument(uuid: UUID): ByteArray {
        logger.debug("Read document from GCP bucket: $bucketName")
        val blob = storage.get(bucketName, uuid.toString())
        return blob.getContent()
    }
}
