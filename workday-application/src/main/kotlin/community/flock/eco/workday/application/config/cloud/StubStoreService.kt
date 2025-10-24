package community.flock.eco.workday.application.config.cloud

import community.flock.eco.workday.core.events.PutObjectStorageEvent
import community.flock.eco.workday.core.services.StorageService
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.ApplicationEventPublisher
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.InputStream

@Component
@ConditionalOnProperty("flock.eco.cloud.stub.enabled")
class StubStoreService(
    private val publisher: ApplicationEventPublisher,
) : StorageService {
    private val logger = LoggerFactory.getLogger(javaClass)

    private val store: MutableMap<String, MutableMap<String, ByteArray>> = mutableMapOf()

    private fun put(
        bucket: String,
        key: String,
        array: ByteArray,
    ) {
        store.getOrPut(bucket) { mutableMapOf() }
            .also {
                it[key] = array
                logger.info("Put file in bucket: $bucket with key: $key")
                publisher.publishEvent(PutObjectStorageEvent(array))
            }
    }

    fun get(
        bucket: String,
        key: String,
    ): ByteArray? =
        store[bucket]?.get(key)
            .also {
                logger.info("Get file from bucket: $bucket and key: $key")
            }

    override fun listObjects(
        bucket: String,
        prefix: String?,
    ): List<String> =
        store[bucket]
            ?.map { it.key }
            ?.filter { it.startsWith(prefix ?: "") }
            ?.take(100)
            ?: listOf()

    override fun hasObject(
        bucket: String,
        key: String,
    ): Boolean {
        return store[bucket]?.contains(key) ?: false
    }

    override fun getObject(
        bucket: String,
        key: String,
    ): ByteArray? {
        return store[bucket]?.get(key)
    }

    override fun putObject(
        bucket: String,
        key: String,
        file: File,
    ): StorageService.StorageObject =
        put(bucket, key, file.readBytes())
            .let { StorageService.StorageObject() }

    override fun putObject(
        bucket: String,
        key: String,
        file: MultipartFile,
    ): StorageService.StorageObject =
        put(bucket, key, file.bytes)
            .let { StorageService.StorageObject() }

    override fun putObject(
        bucket: String,
        key: String,
        input: InputStream,
        length: Long,
    ): StorageService.StorageObject =
        put(bucket, key, input.readBytes())
            .let { StorageService.StorageObject() }

    override fun initChunk(
        bucket: String,
        key: String,
        metadata: Map<String, String>?,
    ): StorageService.StorageMultipartObject =
        put(bucket, key, ByteArray(0))
            .let { StorageService.StorageMultipartObject(uploadId = "0") }

    override fun putChunk(
        bucket: String,
        key: String,
        uploadId: String,
        index: Int,
        file: MultipartFile,
    ): StorageService.StorageChuck =
        get(bucket, key)
            ?.let {
                put(bucket, key, (it + file.bytes))
            }
            .let { StorageService.StorageChuck() }

    override fun putChunk(
        bucket: String,
        key: String,
        uploadId: String,
        index: Int,
        file: File,
    ): StorageService.StorageChuck =
        get(bucket, key)
            ?.let {
                put(bucket, key, it + file.readBytes())
            }
            .let { StorageService.StorageChuck() }

    override fun putChunk(
        bucket: String,
        key: String,
        uploadId: String,
        index: Int,
        length: Long,
        input: InputStream,
    ): StorageService.StorageChuck =
        get(bucket, key)
            ?.let {
                put(bucket, key, (it + input.readBytes()))
            }
            .let { StorageService.StorageChuck() }

    override fun completeChunk(
        bucket: String,
        key: String,
        uploadId: String,
    ): StorageService.StorageObject = StorageService.StorageObject()
}
