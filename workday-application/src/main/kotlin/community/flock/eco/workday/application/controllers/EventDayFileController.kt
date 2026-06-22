package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.core.utils.toResponse
import org.springframework.boot.web.server.MimeMappings
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.util.UUID

@RestController
class EventDayFileController(
    private val documentService: DocumentStorage,
) {
    @GetMapping("/api/events/files/{file}/{name}")
    @PreAuthorize("hasAuthority('EventAuthority.READ')")
    fun getFiles(
        @PathVariable file: UUID,
        @PathVariable name: String,
    ): ResponseEntity<ByteArray> =
        documentService
            .readDocument(file)
            .run {
                ResponseEntity
                    .ok()
                    .contentType(getMediaType(name))
                    .body(this)
            }

    @PostMapping("/api/events/files")
    @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    fun postFiles(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<UUID> =
        documentService
            .storeDocument(file.bytes)
            .toResponse()
}

private fun getMediaType(name: String): MediaType {
    val extension = File(name).extension.lowercase()
    val mime = MimeMappings.DEFAULT[extension] ?: MediaType.APPLICATION_OCTET_STREAM_VALUE
    return MediaType.parseMediaType(mime)
}
