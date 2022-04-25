package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.graphql.AggregationClientPersonAssignmentOverview
import community.flock.eco.workday.graphql.AggregationClientPersonOverview
import community.flock.eco.workday.model.AggregationClient
import community.flock.eco.workday.model.AggregationHoliday
import community.flock.eco.workday.model.AggregationMonth
import community.flock.eco.workday.model.AggregationPerson
import community.flock.eco.workday.services.AggregationService
import community.flock.eco.workday.services.PersonService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@RestController
@RequestMapping("/api/aggregations")
class AggregationController(
    private val personService: PersonService,
    private val aggregationService: AggregationService
) {

    @GetMapping("/total-per-client", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun revenuePerClientByYear(@RequestParam year: Int): List<AggregationClient> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerClient(from, to)
    }

    @GetMapping("/total-per-person-me")
    @PreAuthorize("isAuthenticated()")
    fun totalsPerPersonMeByYearMonth(authentication: Authentication): Map<YearMonth, AggregationPerson?> {
        val now = LocalDate.now()
        val person = personService.findByUserCode(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return (0..12)
            .map {
                val month = YearMonth.from(now.minusMonths(it.toLong()))
                month to aggregationService
                    .totalPerPerson(month.atDay(1), month.atEndOfMonth(), person)
            }
            .toMap()
    }

    @GetMapping("/total-per-person", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerPersonByYear(@RequestParam year: Int): List<AggregationPerson> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerPerson(from, to)
    }

    @GetMapping("/total-per-person", params = ["year", "month"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerPersonByYearMonth(@RequestParam year: Int, @RequestParam month: Int): List<AggregationPerson> {
        val yearMonth = YearMonth.of(year, month)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        return aggregationService.totalPerPerson(from, to)
    }

    @GetMapping("/total-per-month", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerMonthByYear(@RequestParam year: Int): List<AggregationMonth> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerMonth(from, to)
    }

    @GetMapping("/holiday-report", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun holidayReportByYear(@RequestParam year: Int): List<AggregationHoliday> {
        return aggregationService.holidayReport(year)
    }

    @GetMapping("/holiday-report-me", params = ["year"])
    @PreAuthorize("isAuthenticated()")
    fun holidayReportMeByYear(authentication: Authentication, @RequestParam year: Int): AggregationHoliday {
        val person = personService.findByUserCode(authentication.name)
            ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return aggregationService.holidayReportMe(year, person)
    }

    @GetMapping("/client-hour-overview", params = ["year", "month"])
    @PreAuthorize("isAuthenticated()")
    fun hourClientOverviewEmployee(@RequestParam year: Int, @RequestParam month: Int): List<AggregationClientPersonOverview> {
        val yearMonth = YearMonth.of(year, month)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        return aggregationService.clientPersonHourOverview(from, to)
    }

    @GetMapping("/client-assignment-hour-overview", params = ["from", "to"])
    @PreAuthorize("isAuthenticated()")
    fun hourAssignmentClientOverviewEmployee(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate
    ): List<AggregationClientPersonAssignmentOverview> {
        return aggregationService.clientPersonAssignmentHourOverview(from, to)
    }

    @GetMapping("/person-nonproductive-hours-per-day")
    @PreAuthorize("isAuthenticated()")
    fun personNonProductiveHoursPerDay(
        @RequestParam personId: String,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate
    ): ResponseEntity<List<AggregationService.NonProductiveHours>> =
        personService.findByUuid(UUID.fromString(personId))
            ?.let { person ->
                aggregationService.personNonProductiveHoursPerDay(person, from, to)
            }.toResponse()
}
