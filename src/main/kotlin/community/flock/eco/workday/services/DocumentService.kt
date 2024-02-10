package community.flock.eco.workday.services

import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.google.cloud.storage.StorageOptions
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class DocumentService(
    @Value("\${flock.eco.workday.bucket.documents}") val bucketName: String,
) {
    companion object {
        val storage: Storage = StorageOptions.getDefaultInstance().service
        var logger: Logger = LoggerFactory.getLogger(DocumentService::class.java)
    }

    fun storeDocument(byteArray: ByteArray): UUID {
        logger.debug("Store document to bucket: $bucketName")
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

    fun readDocument(uuid: UUID): ByteArray {
        logger.debug("Read document to bucket: $bucketName")
        val blob = storage.get(bucketName, uuid.toString())
        return blob.getContent()
    }
}
