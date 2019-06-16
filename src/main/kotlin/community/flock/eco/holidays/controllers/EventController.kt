package community.flock.eco.holidays.controllers;

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.getUserDetails
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.holidays.authorities.HolidaysAuthority
import community.flock.eco.holidays.model.Event
import community.flock.eco.holidays.model.Holiday
import community.flock.eco.holidays.model.HolidayForm
import community.flock.eco.holidays.model.RemainingDays
import community.flock.eco.holidays.repository.EventRepository
import community.flock.eco.holidays.repository.HolidayRepository
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.LocalDate
import java.util.*

@RestController
@RequestMapping("/api/events")
class EventController(
        private val eventRepository: EventRepository) {

    @GetMapping
    fun findAll(): ResponseEntity<Iterable<Event>> = eventRepository
            .findAll()
            .toResponse()
}
