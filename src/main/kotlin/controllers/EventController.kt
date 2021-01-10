package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.EventAuthority
import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.forms.EventRatingForm
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.EventRating
import community.flock.eco.workday.services.EventRatingService
import community.flock.eco.workday.services.EventService
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
import java.util.*

@RestController
@RequestMapping("/api/events")
class EventController(
    private val eventService: EventService,
    private val eventRatingService: EventRatingService
) {

    @GetMapping()
    @PreAuthorize("hasAuthority('EventAuthority.READ')")
    fun getAll(authentication: Authentication) = eventService
        .findAll(Sort.by("from"))
        .filter { it.isAuthenticated(authentication) }
        .toResponse()

    @GetMapping("/{code}")
    // @PreAuthorize("hasAuthority('EventAuthority.READ')")
    fun findByCode(
        @PathVariable code: String,
        authentication: Authentication?
    ) = eventService
        .findByCode(code)
        ?.applyAuthentication(authentication)
        .toResponse()

    @GetMapping("/{code}/ratings")
    // @PreAuthorize("hasAuthority('EventAuthority.READ')")
    fun findEventRatings(
        @PathVariable code: String,
        authentication: Authentication?
    ) = eventRatingService
        .findByEventCode(code)
        .filter { it.isAuthenticated(authentication) }
        .sortedBy { it.person.lastname }
        .toResponse()

    @PostMapping("/{code}/ratings")
    // @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    fun postRating(
        @PathVariable code: String,
        @RequestBody form: EventRatingForm,
        authentication: Authentication?
    ) = eventRatingService
        .create(EventRatingForm(
            eventCode = code,
            personId = form.personId,
            rating = form.rating
        ))
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    fun post(
        @RequestBody form: EventForm
    ) = eventService
        .create(form)
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: EventForm,
        authentication: Authentication
    ) = eventService
        .update(code, form)
        .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
        authentication: Authentication
    ) = eventService.findByCode(code)
        ?.applyAuthentication(authentication)
        ?.run { eventService.deleteByCode(this.code) }
        .toResponse()

    @DeleteMapping("/{eventCode}/ratings/{personId}")
    // @PreAuthorize("hasAuthority('EventAuthority.WRITE')")
    fun deleteRatings(
        @PathVariable eventCode: String,
        @PathVariable personId: UUID,
        authentication: Authentication
    ) = eventRatingService.deleteByEventCodeAndPersonUuid(eventCode, personId)
        .toResponse()

    private fun Authentication.isAdmin(): Boolean = this.authorities
        .map { it.authority }.contains(EventAuthority.ADMIN.toName())

    private fun Event.isAuthenticated(authentication: Authentication?) = authentication?.isAdmin() == true || this.persons.any { it.isUser(authentication?.name) }
    private fun Event.applyAuthentication(authentication: Authentication?) = apply {
        if (!this.isAuthenticated(authentication)) {
            throw ResponseStatusException(UNAUTHORIZED, "User has not access to event")
        }
    }

    private fun EventRating.isAuthenticated(authentication: Authentication?) = authentication?.isAdmin() == true || this.person.isUser(authentication?.name)
    private fun EventRating.applyAuthentication(authentication: Authentication?) = apply {
        if (!this.isAuthenticated(authentication)) {
            throw ResponseStatusException(UNAUTHORIZED, "User has not access to event rating")
        }
    }
}
