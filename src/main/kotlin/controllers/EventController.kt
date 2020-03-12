package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.services.EventService
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.services.isUser
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/events")
class EventController(
    private val service: EventService,
    private val personService: PersonService
) {

    @GetMapping()
    @PreAuthorize("hasAuthority('SickdayAuthority.ADMIN')")
    fun getAll() = service
        .findAll(Sort.by("from"))
        .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('SickdayAuthority.READ')")
    fun findByCode(
        @PathVariable code: String,
        authentication: Authentication
    ) = service
        .findByCode(code)
        ?.applyAuthentication(authentication)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    fun post(
        @RequestBody form: EventForm,
        authentication: Authentication
    ) = service
        .create(form)
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: EventForm,
        authentication: Authentication
    ) = service
        .update(code, form)
        .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
        authentication: Authentication
    ) = service.findByCode(code)
        ?.applyAuthentication(authentication)
        ?.run { service.deleteByCode(this.code) }
        .toResponse()

    private fun Authentication.isAdmin(): Boolean = this.authorities
        .map { it.authority }
        .contains(SickdayAuthority.ADMIN.toName())

    private fun Event.applyAuthentication(authentication: Authentication) = apply {
        if (!(authentication.isAdmin() || this.persons.any { it.isUser(authentication.name) })) {
            throw ResponseStatusException(UNAUTHORIZED, "User has not access to object")
        }
    }
}
