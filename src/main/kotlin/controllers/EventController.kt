package community.flock.eco.workday.controllers;

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.model.*
import community.flock.eco.workday.repository.EventRepository
import org.springframework.data.domain.Pageable
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.Period

@RestController
@RequestMapping("/api/events")
class EventController(
        private val eventRepository: EventRepository) {


    data class FlockDay(
            val isToday: Boolean,
            val next: Int
    )

    @GetMapping
    fun findAll(pageable: Pageable) = eventRepository
            .findAll(pageable)
            .toResponse(pageable)

    @GetMapping("/flock_day")
    fun isFlockDay() = eventRepository
            .findAll()
            .filter { it.type == EventType.FLOCK_DAY }
            .filter { it.date.toLocalDate() >= LocalDate.now() }
            .sortedBy { it.date }
            .first()
            .let {
                val now = LocalDate.now()
                val date = it.date.toLocalDate()
                FlockDay(
                        isToday = now == date,
                        next = Period
                                .between(now, date)
                                .days
                )
            }
            .toResponse()

}
