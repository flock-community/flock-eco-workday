package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.authorities.LeaveDayAuthority
import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.interfaces.applyAllowedToUpdate
import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.core.utils.toResponse
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus.FORBIDDEN
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
import java.util.UUID

@RestController
@RequestMapping("/api/leave-days")
class LeaveDayController(
    private val service: LeaveDayService,
    private val personService: PersonService,
) {
    @GetMapping(params = ["personId"])
    @PreAuthorize("hasAuthority('LeaveDayAuthority.READ')")
    fun getAll(
        @RequestParam personId: UUID,
        authentication: Authentication,
        pageable: Pageable,
    ): ResponseEntity<List<LeaveDay>> =
        when {
            authentication.isAdmin() -> service.findAllByPersonUuid(personId, pageable)
            else -> service.findAllByPersonUserCode(authentication.name, pageable)
        }.toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('LeaveDayAuthority.READ')")
    fun findByCode(
        @PathVariable code: String,
        authentication: Authentication,
    ) = service
        .findByCode(code)
        ?.applyAuthentication(authentication)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    fun post(
        @RequestBody form: LeaveDayForm,
        authentication: Authentication,
    ) = service
        .create(form.setPersonCode(authentication))
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: LeaveDayForm,
        authentication: Authentication,
    ) = service
        .findByCode(code)
        ?.applyAuthentication(authentication)
        ?.applyAllowedToUpdate(form.status, authentication.isAdmin())
        ?.run {
            service.update(
                code = code,
                form = form,
                isUpdatedByOwner = authentication.isOwnerOf(this),
            )
        }

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('LeaveDayAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
        authentication: Authentication,
    ) = service
        .findByCode(code)
        ?.applyAuthentication(authentication)
        ?.run { service.deleteByCode(this.code) }
        .toResponse()

    private fun LeaveDayForm.setPersonCode(authentication: Authentication): LeaveDayForm {
        if (authentication.isAdmin()) {
            return this
        }
        return personService
            .findByUserCode(authentication.name)
            ?.let {
                this.copy(personId = it.uuid)
            }
            ?: throw ResponseStatusException(FORBIDDEN, "User is not linked to person")
    }

    private fun LeaveDay.applyAuthentication(authentication: Authentication) =
        apply {
            if (!(authentication.isAdmin() || authentication.isOwnerOf(this))) {
                throw ResponseStatusException(FORBIDDEN, "User has no access to object")
            }
        }

    private fun Authentication.isAdmin(): Boolean =
        this.authorities
            .map { it.authority }
            .contains(LeaveDayAuthority.ADMIN.toName())

    private fun Authentication.isOwnerOf(leaveDay: LeaveDay) = isAssociatedWith(leaveDay.person)
}
