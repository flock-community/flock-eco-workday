package community.flock.eco.workday.controllers.ext

import community.flock.eco.workday.config.properties.CalendarProperties
import community.flock.eco.workday.services.CalendarService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/ext/calendar")
class CalendarController(
    private val calendarService: CalendarService,
    private val calendarProperties: CalendarProperties,
) {
    @GetMapping("calendar.ics", produces = ["text/calendar"])
    fun get(
        @RequestParam token: String,
    ): ResponseEntity<String> =
        if (token == calendarProperties.token) {
            ResponseEntity.ok(calendarService.getCalendar().serialize())
        } else {
            ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }
}
