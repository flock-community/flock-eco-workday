package community.flock.eco.workday.controllers;

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.services.AssignmentService
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/assignments")
class AssignmentController(
        private val assignmentService: AssignmentService) {

    @GetMapping
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findAll(pageable: Pageable): ResponseEntity<List<Assignment>> = assignmentService
            .findAll(pageable)
            .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findByCode(@PathVariable code: String): ResponseEntity<Assignment> = assignmentService
            .findByCode(code)
            .toResponse()
}
