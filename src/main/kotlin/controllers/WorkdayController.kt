package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.model.Workday
import community.flock.eco.workday.repository.WorkdayRepository
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.LocalDate
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/workday")
class WorkdayController(private val workdayRepository: WorkdayRepository) {
    @GetMapping
    @PreAuthorize("hasAuthority('SickdayAuthority.READ')")
    fun getWorkday(@RequestParam(required = false) userCode: String?, principal: Principal): ResponseEntity<Iterable<Workday>> {
        return workdayRepository.findAllByClient(Client(1, name = "bol.com")).toResponse()
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SickdayAuthority.READ')")
    fun postWorkday() {

    }
}