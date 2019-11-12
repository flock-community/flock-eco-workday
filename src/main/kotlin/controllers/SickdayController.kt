package community.flock.eco.workday.controllers

import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.services.HolidayService
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/sickdays")
class SickdayController(
    private val userRepository: UserRepository,
    private val periodRepository: PeriodRepository,
    private val holidayService: HolidayService
)
