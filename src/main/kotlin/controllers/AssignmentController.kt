package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.authorities.AssignmentAuthority
import community.flock.eco.workday.forms.AssignmentForm
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.services.AssignmentService
import community.flock.eco.workday.services.ProjectService
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
import java.security.Principal
import java.util.UUID

@RestController
@RequestMapping("/api/assignments")
class AssignmentController(
    private val userService: UserService,
    private val assignmentService: AssignmentService,
    private val projectService: ProjectService
) {

    @GetMapping(params = ["personId"])
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findAll(@RequestParam(required = false) personId: UUID?, principal: Principal): ResponseEntity<Iterable<Assignment>> =
        principal.findUser()
            ?.let { user ->
                if (user.isAdmin() && personId != null) {
                    assignmentService.findAllByPersonUuid(personId)
                } else {
                    assignmentService.findAllByPersonUserCode(user.code)
                }
                    .sortedBy { it.from }
                    .reversed()
            }
            .toResponse()

    @GetMapping(params = ["projectCode"])
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findAll(@RequestParam projectCode: String, principal: Principal): List<Assignment>? =
        principal.findUser()
            ?.takeIf { it.isAdmin() }
            // TODO: Maybe return 403 here if not admin?
            ?.let { projectService.findByCode(projectCode) }
            ?.let { assignmentService.findByProject(it) }
            ?: emptyList()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findByCode(@PathVariable code: String): ResponseEntity<Assignment> = assignmentService
        .findByCode(code)
        .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('AssignmentAuthority.WRITE')")
    fun post(@RequestBody form: AssignmentForm, principal: Principal) = principal
        .findUser()
        ?.let { user ->
            val personCode = when {
                user.isAdmin() -> form.personId
                else -> UUID.fromString(user.code)
            }
            assignmentService.create(form.copy(personId = personCode))
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
