package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.LeaveDayAuthority
import community.flock.eco.workday.forms.HoliDayForm
import community.flock.eco.workday.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.services.LeaveDayService
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.services.isUser
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatus.UNAUTHORIZED
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
import org.springframework.web.server.ResponseStatusException
import java.util.*

@RestController
@RequestMapping("/api/holidays")
class LeaveDayController(
    private val service: LeaveDayService,
    private val personService: PersonService
) {
    @GetMapping(params = ["personId"])
    @PreAuthorize("hasAuthority('LeaveDayAuthority.READ')")
    fun getAll(
        @RequestParam personId: UUID,
        authentication: Authentication,
        pageable: Pageable
    ): ResponseEntity<List<HoliDay>> = when {
        authentication.isAdmin() -> service.findAllByPersonUuid(personId, pageable)
        else -> service.findAllByPersonUserCode(authentication.name, pageable)
    }.toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('LeaveDayAuthority.READ')")
    fun findByCode(
        @PathVariable code: String,
        authentication: Authentication
    ) = service
        .findByCode(code)
        ?.applyAuthentication(authentication)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    fun post(
        @RequestBody form: HoliDayForm,
        authentication: Authentication
    ) = service
        .create(form.setPersonCode(authentication))
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: HoliDayForm,
        authentication: Authentication
    ) =
        service.findByCode(code)
            ?.applyAuthentication(authentication)
            ?.applyAllowedToUpdate(form.status, authentication.isAdmin())
            ?.run { service.update(code, form) }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
        authentication: Authentication
    ) = service.findByCode(code)
        ?.applyAuthentication(authentication)
        ?.run { service.deleteByCode(this.code) }
        .toResponse()

    private fun HoliDayForm.setPersonCode(authentication: Authentication): HoliDayForm {
        if (authentication.isAdmin()) {
            return this
        }
        return personService.findByUserCode(authentication.name)
            ?.let {
                this.copy(personId = it.uuid)
            }
            ?: throw ResponseStatusException(UNAUTHORIZED, "User is not linked to person")
    }

    private fun Authentication.isAdmin(): Boolean = this.authorities
        .map { it.authority }
        .contains(LeaveDayAuthority.ADMIN.toName())

    private fun HoliDay.applyAuthentication(authentication: Authentication) = apply {
        if (!(authentication.isAdmin() || this.person.isUser(authentication.name))) {
            throw ResponseStatusException(UNAUTHORIZED, "User has not access to object")
        }
    }

    private fun HoliDay.applyAllowedToCreate(form: HoliDayForm, authentication: Authentication): HoliDay = apply {
        if (this.status !== Status.REQUESTED && !authentication.isAdmin()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to change workday")
        }
        if (form.status !== this.status && !authentication.isAdmin()) {
            throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to change status field")
        }
    }
}
