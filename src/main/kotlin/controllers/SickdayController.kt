package community.flock.eco.workday.controllers;

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.services.HolidayService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/sickdays")
class SickdayController(
        private val userRepository: UserRepository,
        private val periodRepository: PeriodRepository,
        private val holidayService: HolidayService) {


}
