package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.authorities.AssignmentAuthority
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.services.AssignmentService
import java.security.Principal
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/assignments")
class AssignmentController(
    private val userService: UserService,
    private val assignmentService: AssignmentService
) {

    @GetMapping
    @PreAuthorize("hasAuthority('HolidayAuthority.READ')")
    fun findAll(@RequestParam(required = false) userCode: String?, principal: Principal): ResponseEntity<Iterable<Assignment>> =
            principal.findUser()
                    ?.let { user ->
                        if (user.isAdmin() && userCode != null) {
                            assignmentService.findAllByUserCode(userCode)
                        } else {
                            assignmentService.findAllByUserCode(user.code)
                        }
                    }.toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findByCode(@PathVariable code: String): ResponseEntity<Assignment> = assignmentService
            .findByCode(code)
            .toResponse()

    private fun Principal.findUser(): User? = userService
            .findByCode(this.name)

    private fun User.isAdmin(): Boolean = this.authorities
            .contains(AssignmentAuthority.ADMIN.toName())
}
