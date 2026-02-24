package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.JobCreate
import community.flock.eco.workday.api.endpoint.JobDeleteByCode
import community.flock.eco.workday.api.endpoint.JobFindAll
import community.flock.eco.workday.api.endpoint.JobFindByCode
import community.flock.eco.workday.api.endpoint.JobUpdate
import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Job
import community.flock.eco.workday.application.model.JobStatus
import community.flock.eco.workday.application.services.DocumentStorage
import community.flock.eco.workday.application.services.JobService
import community.flock.eco.workday.core.utils.toResponse
import org.springframework.boot.web.server.MimeMappings
import org.springframework.data.domain.PageRequest
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
import community.flock.eco.workday.api.model.Client as ClientApi
import community.flock.eco.workday.api.model.Job as JobApi
import community.flock.eco.workday.api.model.JobDocument as JobDocumentApi
import community.flock.eco.workday.api.model.JobStatus as JobStatusApi

interface JobHandler :
    JobFindAll.Handler,
    JobFindByCode.Handler,
    JobCreate.Handler,
    JobUpdate.Handler,
    JobDeleteByCode.Handler

@RestController
class JobController(
    private val jobService: JobService,
    private val documentService: DocumentStorage,
) : JobHandler {
    @PreAuthorize("hasAuthority('JobAuthority.READ')")
    override suspend fun jobFindAll(request: JobFindAll.Request): JobFindAll.Response<*> {
        val pageable = PageRequest.of(request.queries.pageable.page, request.queries.pageable.size)
        val page =
            if (request.queries.status != null) {
                jobService.findAllByStatus(JobStatus.valueOf(request.queries.status!!), pageable)
            } else {
                jobService.findAll(pageable)
            }
        return JobFindAll.Response200(page.content.map { it.produce() })
    }

    @PreAuthorize("hasAuthority('JobAuthority.READ')")
    override suspend fun jobFindByCode(request: JobFindByCode.Request): JobFindByCode.Response<*> =
        jobService
            .findByCode(request.path.code)
            ?.produce()
            ?.let { JobFindByCode.Response200(it) }
            ?: error("Job not found")

    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    override suspend fun jobCreate(request: JobCreate.Request): JobCreate.Response<*> =
        jobService
            .create(request.body)
            ?.produce()
            ?.let { JobCreate.Response200(it) }
            ?: error("Cannot create job")

    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    override suspend fun jobUpdate(request: JobUpdate.Request): JobUpdate.Response<*> =
        jobService
            .update(request.path.code, request.body)
            ?.produce()
            ?.let { JobUpdate.Response200(it) }
            ?: error("Cannot update job")

    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    override suspend fun jobDeleteByCode(request: JobDeleteByCode.Request): JobDeleteByCode.Response<*> {
        jobService.deleteByCode(request.path.code)
        return JobDeleteByCode.Response200(Unit)
    }

    @PostMapping("/api/jobs/files")
    @PreAuthorize("hasAuthority('JobAuthority.WRITE')")
    fun postFiles(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<UUID> =
        documentService
            .storeDocument(file.bytes)
            .toResponse()

    @GetMapping("/api/jobs/files/{file}/{name}")
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

private fun Job.produce(): JobApi =
    JobApi(
        id = id,
        code = code,
        title = title,
        description = description,
        hourlyRate = hourlyRate,
        hoursPerWeek = hoursPerWeek,
        from = from?.toString(),
        to = to?.toString(),
        status = JobStatusApi.valueOf(status.name),
        client =
            client?.let {
                ClientApi(
                    id = it.id,
                    code = it.code,
                    name = it.name,
                )
            },
        documents = documents.map { it.produce() },
    )

private fun Document.produce(): JobDocumentApi =
    JobDocumentApi(
        name = name,
        file = file.toString(),
    )
