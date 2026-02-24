package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.forms.JobForm
import community.flock.eco.workday.application.model.Job
import community.flock.eco.workday.application.model.JobStatus
import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.application.services.JobService
import community.flock.eco.workday.core.utils.toResponse
import org.springframework.boot.web.server.MimeMappings
import org.springframework.data.domain.Pageable
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.util.UUID

@RestController
@RequestMapping("/api/jobs")
class JobController(
    private val jobService: JobService,
    private val documentService: DocumentStorage,
) {
    @GetMapping
    @PreAuthorize("hasAuthority('JobAuthority.READ')")
    fun findAll(
        @RequestParam status: String?,
        pageable: Pageable,
    ): ResponseEntity<List<Job>> =
        if (status != null) {
            jobService.findAllByStatus(JobStatus.valueOf(status), pageable)
        } else {
            jobService.findAll(pageable)
        }.toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('JobAuthority.READ')")
    fun findByCode(
        @PathVariable code: String,
    ): ResponseEntity<Job> =
        jobService
            .findByCode(code)
            .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    fun post(
        @RequestBody form: JobForm,
    ): ResponseEntity<Job> =
        jobService
            .create(form)
            .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: JobForm,
    ): ResponseEntity<Job> =
        jobService
            .update(code, form)
            .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
    ): ResponseEntity<Unit> =
        jobService
            .deleteByCode(code)
            .toResponse()

    @PostMapping("/files")
    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    fun postFiles(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<UUID> =
        documentService
            .storeDocument(file.bytes)
            .toResponse()

    @GetMapping("/files/{file}/{name}")
    @PreAuthorize("hasAuthority('JobAuthority.READ')")
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

    private fun getMediaType(name: String): MediaType {
        val extension = File(name).extension.lowercase()
        val mime = MimeMappings.DEFAULT[extension]
        return MediaType.parseMediaType(mime)
    }
}
