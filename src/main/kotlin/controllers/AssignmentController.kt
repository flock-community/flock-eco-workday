package community.flock.eco.workday.controllers;

import community.flock.eco.workday.repository.AssignmentRepository
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/assignments")
class AssignmentController(
        private val assignmentRepository: AssignmentRepository) {


}
