package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.authorities.PersonAuthority
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.PersonService
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus.BAD_REQUEST
import org.springframework.http.HttpStatus.NOT_FOUND
import org.springframework.http.HttpStatus.UNAUTHORIZED
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.security.Principal

@RestController
@RequestMapping("/api/persons")
class PersonController(
    private val service: PersonService,
    private val userService: UserService
) {

    @GetMapping("/me")
    fun findByMe(principal: Principal): ResponseEntity<Person> = service
        .findByUserCode(principal.name)
        .toResponse()

    @GetMapping
    @PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")
    fun findAll(pageable: Pageable, principal: Principal) = service
        .findAll(pageable)
        .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('PersonAuthority.READ')")
    fun findByCode(@PathVariable code: String, principal: Principal): ResponseEntity<Person> = principal
        .findUser()
        ?.let {
            when {
                it.isAdmin() -> service.findByCode(code)?.toResponse()
                else -> service.findByUserCode(it.code)?.toResponse()
            }
                ?: throw ResponseStatusException(NOT_FOUND, "No Item found with this PersonCode")
        }
        ?: throw ResponseStatusException(UNAUTHORIZED)

    @PostMapping
    @PreAuthorize("hasAuthority('PersonAuthority.WRITE')")
    fun post(@RequestBody form: PersonForm, principal: Principal) = principal
        .findUser()
        ?.let { user ->
            val userCode = when {
                user.isAdmin() -> null
                else -> user.code
            }
            form.copy(userCode = userCode)
                .let { service.create(it) }
        }
        ?: throw ResponseStatusException(UNAUTHORIZED)

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('PersonAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: PersonForm,
        principal: Principal
    ) = principal
        .findUser()
        ?.let {
            val userCode = when {
                it.isAdmin() -> form.userCode
                else -> it.code
            }
            form.copy(userCode = userCode)
                .let {
                    service.update(code, form)
                }
                ?.toResponse()
                ?: throw ResponseStatusException(
                    BAD_REQUEST, "Cannot perform PUT on given item. PersonCode cannot be found. Use POST Method"
                )
        }
        ?: throw ResponseStatusException(UNAUTHORIZED)

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('PersonAuthority.ADMIN')")
    fun delete(@PathVariable code: String, principal: Principal) =
        principal
            .findUser()
            ?.let {
                service
                    .deleteByCode(code)
                    .toResponse()
            }
            ?: throw ResponseStatusException(UNAUTHORIZED)

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
