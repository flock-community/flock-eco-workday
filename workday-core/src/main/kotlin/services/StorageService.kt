package community.flock.eco.core.services

import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.io.InputStream

interface StorageService {
    class StorageObject()

    data class StorageMultipartObject(
        val uploadId: String,
    )

    class StorageChuck

    fun listObjects(
        bucket: String,
        prefix: String?,
    ): List<String>

    fun hasObject(
        bucket: String,
        key: String,
    ): Boolean

    fun getObject(
        bucket: String,
        key: String,
    ): ByteArray?

    fun putObject(
        bucket: String,
        key: String,
        file: File,
    ): StorageObject

    fun putObject(
        bucket: String,
        key: String,
        file: MultipartFile,
    ): StorageObject

    fun putObject(
        bucket: String,
        key: String,
        input: InputStream,
        length: Long,
    ): StorageObject

    fun initChunk(
        bucket: String,
        key: String,
        metadata: Map<String, String>? = null,
    ): StorageMultipartObject

    fun putChunk(
        bucket: String,
        key: String,
        uploadId: String,
        index: Int,
        file: MultipartFile,
    ): StorageChuck

    fun putChunk(
        bucket: String,
        key: String,
        uploadId: String,
        index: Int,
        file: File,
    ): StorageChuck

    fun putChunk(
        bucket: String,
        key: String,
        uploadId: String,
        index: Int,
        length: Long,
        input: InputStream,
    ): StorageChuck

    fun completeChunk(
        bucket: String,
        key: String,
        uploadId: String,
    ): StorageObject
}
