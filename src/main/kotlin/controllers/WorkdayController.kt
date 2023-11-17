package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.WorkDayAuthority
import community.flock.eco.workday.forms.WorkDayForm
import community.flock.eco.workday.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.model.WorkDaySheet
import community.flock.eco.workday.services.AssignmentService
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
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.server.ResponseStatusException
import java.time.temporal.ChronoUnit
import java.util.*

@RestController
@RequestMapping("/api/workdays")
class WorkdayController(
    private val service: WorkDayService,
    private val assignmentService: AssignmentService,
) {
    @GetMapping(params = ["personId"])
    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    fun getAll(
        @RequestParam personId: UUID,
        authentication: Authentication,
        pageable: Pageable
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
        authentication: Authentication
    ) = service
        .findByCode(code)
        ?.applyAuthentication(authentication)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun post(
        @RequestBody form: WorkDayForm,
        @RequestHeader(value = "context-person-id", required = false) personId: String?, //TODO make required
        authentication: Authentication
    ): ResponseEntity<WorkDay> = form
        .validate()
        .copy(status = Status.REQUESTED)
        .consume()
        .also {
            personId?.let { x ->
                require(x == it.assignment.person.uuid.toString())
                { "Assignment ${it.assignment.code} is not owned by Person $personId." }
            }
        }
        .let { service.create(it) }
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: WorkDayForm,
        authentication: Authentication
    ) = service.findByCode(code)
        ?.applyAuthentication(authentication)
        ?.applyAllowedToUpdate(form.status, authentication.isAdmin())
        ?.run { service.update(code, form) }
        .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
        authentication: Authentication
    ) = service.findByCode(code)
        ?.applyAuthentication(authentication)
        ?.run { service.deleteByCode(this.code) }
        .toResponse()

    @GetMapping("/sheets/{file}/{name}")
    @PreAuthorize("hasAuthority('WorkDayAuthority.READ')")
    fun getSheets(
        @PathVariable file: UUID,
        @PathVariable name: String,
        authentication: Authentication
    ) = service.readSheet(file)
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
        authentication: Authentication
    ) = service
        .uploadSheet(file.bytes)
        .toResponse()

    private fun Authentication.isAdmin(): Boolean = this.authorities
        .map { it.authority }
        .contains(WorkDayAuthority.ADMIN.toName())

    private fun WorkDay.applyAuthentication(authentication: Authentication) = apply {
        if (!(authentication.isAdmin() || this.assignment.person.isUser(authentication.name))) {
            throw ResponseStatusException(UNAUTHORIZED, "User has not access to workday: ${this.code}")
        }
    }

    private fun getMediaType(name: String): MediaType {
        val extension = java.io.File(name).extension.toLowerCase()
        val mime = org.springframework.boot.web.server.MimeMappings.DEFAULT.get(extension)
        return MediaType.parseMediaType(mime)
    }

    private fun WorkDayForm.validate() = apply {
        val daysBetween = ChronoUnit.DAYS.between(from, to) + 1
        if (hours < 0) {
            error("Hours cannot have negative value")
        }
        if (days?.any { it < 0 } == true) {
            error("Days cannot have negative value")
        }
        if (days != null) {
            if (days.size.toLong() != daysBetween) {
                error("amount of days ($daysBetween) not equal to period (${days.size})")
            }
            if (days.sum() != hours) {
                error("Total hour does not match sum: ${days.sum()} hours: $hours")
            }
        }
    }

    private fun WorkDayForm.consume(it: WorkDay? = null): WorkDay {
        val assignment = assignmentService
            .findByCode(this.assignmentCode)
            ?: error("Cannot find assignment: ${this.assignmentCode}")

        // -- person id check


        return WorkDay(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            from = this.from,
            to = this.to,
            assignment = assignment,
            hours = this.hours,
            days = this.days,
            status = this.status,
            sheets = this.sheets.map {
                WorkDaySheet(
                    name = it.name,
                    file = it.file
                )
            }
        )
    }


}
