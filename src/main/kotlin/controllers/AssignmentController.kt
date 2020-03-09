package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.authorities.AssignmentAuthority
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.services.AssignmentService
import java.security.Principal
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
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
@RequestMapping("/api/assignments")
class AssignmentController(
    private val userService: UserService,
    private val assignmentService: AssignmentService
) {

    @GetMapping(params = ["personCode"])
    @PreAuthorize("hasAuthority('HolidayAuthority.READ')")
    fun findAll(@RequestParam(required = false) personCode: String?, principal: Principal): ResponseEntity<Iterable<Assignment>> =
        principal.findUser()
            ?.let { user ->
                if (user.isAdmin() && personCode != null) {
                    assignmentService.findAllByPersonCode(personCode)
                        .sortedBy { it.from }
                        .reversed()
                } else {
                    assignmentService.findAllByPersonUserCode(user.code)
                        .sortedBy { it.from }
                        .reversed()
                }
            }
            .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findByCode(@PathVariable code: String): ResponseEntity<Assignment> = assignmentService
        .findByCode(code)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('AssignmentAuthority.WRITE')")
    fun post(@RequestBody form: AssignmentForm, principal: Principal) = principal
        .findUser()
        ?.let { person ->
            val personCode = when {
                person.isAdmin() -> form.personCode
                else -> person.code
            }
            form.copy(personCode = personCode)

            return@let assignmentService.create(form)
        }
        ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    @PutMapping("/{code}")
    @PreAuthorize("hasAuthority('AssignmentAuthority.WRITE')")
    fun put(
        @PathVariable code: String,
        @RequestBody form: AssignmentForm,
        principal: Principal
    ) = principal
        .findUser()
        ?.let {
            assignmentService
                .update(code, form)
        }
        .toResponse()

    @DeleteMapping("/{code}")
    @PreAuthorize("hasAuthority('AssignmentAuthority.ADMIN')")
    fun delete(@PathVariable code: String, principal: Principal) =
        principal
            .findUser()
            ?.let {
                assignmentService
                    .deleteByCode(code)
                    .toResponse()
            }
            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    private fun Principal.findUser(): User? = userService
        .findByCode(this.name)

    private fun User.isAdmin(): Boolean = this
        .authorities
        .contains(AssignmentAuthority.ADMIN.toName())
}
