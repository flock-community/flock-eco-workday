package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.services.WorkDayService
import community.flock.eco.workday.services.isUser
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
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
import org.springframework.web.server.ResponseStatusException
import java.util.UUID

@RestController
@RequestMapping("/api/workdays")
class WorkdayController(
    private val service: WorkDayService,
    private val personService: PersonService,
) {
    @GetMapping(params = ["personId"])
    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    fun getAll(
        @RequestParam personId: UUID,
        authentication: Authentication,
        pageable: Pageable,
    ): ResponseEntity<List<WorkDay>> {
        val sort = Sort.by("from").descending().and(Sort.by("id"))
        val page = PageRequest.of(pageable.pageNumber, pageable.pageSize, sort)
        return when {
            authentication.isAdmin() -> service.findAllByPersonUuid(personId, page)
            else -> service.findAllByPersonUserCode(authentication.name, page)
        }
            .toResponse()
    }

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    fun findByCode(
        @PathVariable code: String,
        authentication: Authentication,
    ) = service
        .findByCode(code)
        ?.applyAuthentication(authentication)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun post(
        @RequestBody form: WorkDayForm,
        authentication: Authentication,
    ) = service
        .create(form)
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: WorkDayForm,
        authentication: Authentication,
    ) = service.findByCode(code)
        ?.applyAuthentication(authentication)
        ?.applyAllowedToUpdate(form.status, authentication.isAdmin())
        ?.run { service.update(code, form) }
        .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
        authentication: Authentication,
    ) = service.findByCode(code)
        ?.applyAuthentication(authentication)
        ?.run { service.deleteByCode(this.code) }
        .toResponse()

    @GetMapping("/sheets/{file}/{name}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    fun getSheets(
        @PathVariable file: UUID,
        @PathVariable name: String,
        authentication: Authentication,
    ): ResponseEntity<ByteArray> =
        service.readSheet(file)
            .run {
                ResponseEntity
                    .ok()
                    .contentType(getMediaType(name))
                    .body(this)
            }

    @PostMapping("/sheets")
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun postSheets(
        @RequestParam("file") file: MultipartFile,
        authentication: Authentication,
    ) = service
        .uploadSheet(file.bytes)
        .toResponse()

    private fun Authentication.isAdmin(): Boolean =
        this.authorities
            .map { it.authority }
            .contains(WorkDayAuthority.ADMIN.toName())

    private fun WorkDay.applyAuthentication(authentication: Authentication) =
        apply {
            if (!(authentication.isAdmin() || this.assignment.person.isUser(authentication.name))) {
                throw ResponseStatusException(UNAUTHORIZED, "User has not access to workday: ${this.code}")
            }
        }

    private fun getMediaType(name: String): MediaType {
        val extension = java.io.File(name).extension.lowercase()
        val mime = org.springframework.boot.web.server.MimeMappings.DEFAULT.get(extension)
        return MediaType.parseMediaType(mime)
    }
}
