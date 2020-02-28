package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.services.SickdayService
import community.flock.eco.workday.services.isUser
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

@RestController
@RequestMapping("/api/sickdays")
class SickdayController(
    private val service: SickdayService,
    private val personService: PersonService
) {
    @GetMapping(params = ["personCode"])
    @PreAuthorize("hasAuthority('SickdayAuthority.READ')")
    fun getAll(
        @RequestParam personCode: String,
        authentication: Authentication
    ): ResponseEntity<Iterable<Sickday>> = when {
        authentication.isAdmin() -> service.findAllByPersonCode(personCode)
        else -> service.findAllByPersonUserCode(authentication.name)
    }.toResponse()

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
        @RequestBody form: SickdayForm,
        authentication: Authentication
    ) = service
        .create(form.setPersonCode(authentication))
        .toResponse()

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: SickdayForm,
        authentication: Authentication
    ) = service
        .update(code, form.setPersonCode(authentication))
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

    private fun SickdayForm.setPersonCode(authentication: Authentication): SickdayForm {
        if (authentication.isAdmin()) {
            return this
        }
        return personService.findByUserCode(authentication.name)
            ?.let {
                this.copy(personCode = it.code)
            }
            ?: throw ResponseStatusException(UNAUTHORIZED, "User is not linked to person")
    }

    private fun Authentication.isAdmin(): Boolean = this.authorities
        .map { it.authority }
        .contains(SickdayAuthority.ADMIN.toName())

    private fun Sickday.applyAuthentication(authentication: Authentication) = apply {
        if (!(authentication.isAdmin() || this.person.isUser(authentication.name))) {
            throw ResponseStatusException(UNAUTHORIZED, "User has not access to object")
        }
    }
}
