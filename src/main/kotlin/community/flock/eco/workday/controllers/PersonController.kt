package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.authorities.PersonAuthority
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.PersonService
import org.springframework.data.domain.Pageable
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus.BAD_REQUEST
import org.springframework.http.HttpStatus.NOT_FOUND
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
import java.security.Principal
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/persons")
class PersonController(
    private val service: PersonService,
    private val userService: UserService,
) {
    @GetMapping("/me")
    fun findByMe(authentication: Authentication): ResponseEntity<Person> =
        service
            .findByUserCode(authentication.name)
            .toResponse()

    @GetMapping
    @PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")
    fun findAll(
        pageable: Pageable,
        principal: Principal,
        @RequestParam active: Boolean?,
    ): ResponseEntity<List<Person>> {
        val page =
            active
                ?.let { service.findAllByActive(pageable, active) }
                ?: service.findAll(pageable)
        return page.toResponse()
    }

    @GetMapping("/{uuid}")
    @PreAuthorize("hasAuthority('PersonAuthority.READ')")
    fun findByUui(
        @PathVariable uuid: UUID,
        principal: Principal,
    ): ResponseEntity<Person> =
        principal
            .findUser()
            ?.let {
                when {
                    it.isAdmin() -> service.findByUuid(uuid)?.toResponse()
                    else -> service.findByUserCode(it.code)?.toResponse()
                }
                    ?: throw ResponseStatusException(NOT_FOUND, "No Item found with this PersonUui")
            }
            ?: throw ResponseStatusException(UNAUTHORIZED)

    @GetMapping(params = ["search"])
    @PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")
    fun findAllByFullName(
        pageable: Pageable,
        @RequestParam search: String,
    ) = service
        .findAllByFullName(pageable, search)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('PersonAuthority.WRITE')")
    fun post(
        @RequestBody form: PersonForm,
        principal: Principal,
    ) = principal
        .findUser()
        ?.let { user ->
            val userUui =
                when {
                    user.isAdmin() -> null
                    else -> user.code
                }
            form.copy(userCode = userUui)
                .let { service.create(it) }
        }

        ?: throw ResponseStatusException(UNAUTHORIZED)

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('PersonAuthority.WRITE')")
    fun put(
        @PathVariable code: UUID,
        @RequestBody form: PersonForm,
        principal: Principal,
    ) = principal
        .findUser()
        ?.let {
            val userCode =
                when {
                    it.isAdmin() -> form.userCode
                    else -> it.code
                }
            form.copy(userCode = userCode)
                .let {
                    service.update(code, form)
                }
                ?.toResponse()
                ?: throw ResponseStatusException(
                    BAD_REQUEST, "Cannot perform PUT on given item. PersonUui cannot be found. Use POST Method",
                )
        }
        ?: throw ResponseStatusException(UNAUTHORIZED)

    @DeleteMapping("/{personId}")
    @PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")
    fun delete(
        @PathVariable personId: UUID,
        principal: Principal,
    ) = principal
        .findUser()
        ?.let {
            service
                .deleteByUuid(personId)
                .toResponse()
        }
        ?: throw ResponseStatusException(UNAUTHORIZED)

    @GetMapping("/specialDates")
    @PreAuthorize("hasAuthority('PersonAuthority.READ')")
    fun specialDates(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) start: LocalDate,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) end: LocalDate,
    ) = service.findAllPersonEvents(start, end)

    // *-- utility functions --*

    /**
     * add findUser() function to Principal
     * @return <code>User?</code> a user if found with given user code in the db
     */
    private fun Principal.findUser(): User? = userService.findByCode(this.name)

    /**
     * Evaluate if user has admin authorities on Sickday
     * @return <code>true</code> if user is admin or has admin authorities
     */
    private fun User.isAdmin(): Boolean = this.authorities.contains(PersonAuthority.ADMIN.toName())
}
