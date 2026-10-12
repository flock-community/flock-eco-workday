package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteClient
import community.flock.eco.workday.api.endpoint.GetClientAll
import community.flock.eco.workday.api.endpoint.GetClientByCode
import community.flock.eco.workday.api.endpoint.PostClient
import community.flock.eco.workday.api.endpoint.PutClient
import community.flock.eco.workday.application.forms.ClientForm
import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.services.ClientService
import community.flock.eco.workday.application.services.DocumentStorage
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus.BAD_REQUEST
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.io.File
import java.util.UUID
import community.flock.eco.workday.api.model.ClientForm as ClientFormApi

@RestController
class ClientController(
    private val clientService: ClientService,
    private val documentStorage: DocumentStorage,
) : GetClientAll.Handler,
    GetClientByCode.Handler,
    PostClient.Handler,
    PutClient.Handler,
    DeleteClient.Handler {
    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    override suspend fun getClientAll(request: GetClientAll.Request): GetClientAll.Response<*> {
        val page =
            PageRequest.of(
                request.queries.page ?: 0,
                request.queries.size ?: 20,
                request.queries.sort?.toSort() ?: Sort.unsorted(),
            )
        return GetClientAll.Response200(
            clientService
                .findAll(page)
                .content
                .map { it.produce() },
        )
    }

    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    override suspend fun getClientByCode(request: GetClientByCode.Request): GetClientByCode.Response<*> {
        val client =
            clientService.findByCode(request.path.code)
                ?: error("Client with code ${request.path.code} not found")
        return GetClientByCode.Response200(client.produce())
    }

    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    override suspend fun postClient(request: PostClient.Request): PostClient.Response<*> {
        val client =
            clientService.create(request.body.internalize())
                ?: error("Could not create client")
        return PostClient.Response200(client.produce())
    }

    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    override suspend fun putClient(request: PutClient.Request): PutClient.Response<*> {
        val client =
            clientService.update(request.path.code, request.body.internalize())
                ?: error("Client with code ${request.path.code} not found")
        return PutClient.Response200(client.produce())
    }

    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    override suspend fun deleteClient(request: DeleteClient.Request): DeleteClient.Response<*> {
        clientService.delete(request.path.code)
        return DeleteClient.Response200(Unit)
    }

    // Logos are stored with the same document storage as expense files. Like those endpoints this is
    // plain Spring MVC because wirespec can't handle multipart uploads or raw byte responses yet.
    @GetMapping("/api/clients/logos/{file}/{name}")
    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    fun getLogo(
        @PathVariable file: UUID,
        @PathVariable name: String,
    ): ResponseEntity<ByteArray> {
        val mediaType = logoMediaType(name) ?: throw ResponseStatusException(BAD_REQUEST, "Unsupported logo type")
        return ResponseEntity
            .ok()
            .contentType(mediaType)
            .body(documentStorage.readDocument(file))
    }

    @PostMapping("/api/clients/logos")
    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    fun postLogo(
        @RequestParam("file") file: MultipartFile,
    ): ResponseEntity<UUID> {
        if (logoMediaType(file.originalFilename ?: "") == null) {
            throw ResponseStatusException(BAD_REQUEST, "Logo must be a png, jpeg, gif or webp image")
        }
        return ResponseEntity.ok(documentStorage.storeDocument(file.bytes))
    }

    private fun logoMediaType(name: String): MediaType? =
        LOGO_MEDIA_TYPES[File(name).extension.lowercase()]?.let(MediaType::parseMediaType)

    private fun ClientFormApi.internalize() =
        ClientForm(
            name = name ?: "",
            logo = logo?.let { Document(name = it.name, file = UUID.fromString(it.file.value)) },
        )

    private fun String.toSort(): Sort =
        split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .let { parts ->
                when {
                    parts.isEmpty() -> Sort.unsorted()
                    parts.size == 1 -> Sort.by(parts[0])
                    parts.last().equals("asc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.ASC, *parts.dropLast(1).toTypedArray())
                    parts.last().equals("desc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.DESC, *parts.dropLast(1).toTypedArray())
                    else -> Sort.by(*parts.toTypedArray())
                }
            }

    companion object {
        // Deliberately excludes svg: it can carry scripts and is served from our own origin.
        private val LOGO_MEDIA_TYPES =
            mapOf(
                "png" to "image/png",
                "jpg" to "image/jpeg",
                "jpeg" to "image/jpeg",
                "gif" to "image/gif",
                "webp" to "image/webp",
            )
    }
}
