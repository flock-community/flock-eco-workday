package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.model.AggregationClient
import community.flock.eco.workday.model.AggregationClientPersonAssignmentItem
import community.flock.eco.workday.model.AggregationClientPersonAssignmentOverview
import community.flock.eco.workday.model.AggregationClientPersonOverview
import community.flock.eco.workday.model.AggregationIdentifier
import community.flock.eco.workday.model.AggregationLeaveDay
import community.flock.eco.workday.model.AggregationMonth
import community.flock.eco.workday.model.AggregationPerson
import community.flock.eco.workday.model.AggregationPersonClientRevenueItem
import community.flock.eco.workday.model.PersonHolidayDetails
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
import java.math.BigDecimal
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID
import community.flock.eco.workday.api.AggregationClient as AggregationClientApi
import community.flock.eco.workday.api.AggregationClientPersonAssignmentItem as AggregationClientPersonAssignmentItemApi
import community.flock.eco.workday.api.AggregationClientPersonAssignmentOverview as AggregationClientPersonAssignmentOverviewApi
import community.flock.eco.workday.api.AggregationClientPersonItem as AggregationClientPersonItemApi
import community.flock.eco.workday.api.AggregationClientPersonOverview as AggregationClientPersonOverviewApi
import community.flock.eco.workday.api.AggregationIdentifier as AggregationIdentifierApi
import community.flock.eco.workday.api.AggregationLeaveDay as AggregationLeaveDayApi
import community.flock.eco.workday.api.AggregationPerson as AggregationPersonApi
import community.flock.eco.workday.api.AggregationPersonClientRevenueItem as AggregationPersonClientRevenueItemApi
import community.flock.eco.workday.api.AggregationPersonClientRevenueOverview as AggregationPersonClientRevenueOverviewApi
import community.flock.eco.workday.api.NonProductiveHours as NonProductiveHoursApi
import community.flock.eco.workday.api.PersonHolidayDetails as PersonHolidayDetailsApi

@RestController
@RequestMapping("/api/aggregations")
class AggregationController(
    private val personService: PersonService,
    private val aggregationService: AggregationService,
) {
    @GetMapping("/total-per-client", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun revenuePerClientByYear(
        @RequestParam year: Int,
    ): List<AggregationClientApi> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerClient(from, to).map(AggregationClient::produce)
    }

    @GetMapping("/total-per-person-me")
    @PreAuthorize("isAuthenticated()")
    fun totalsPerPersonMeByYearMonth(authentication: Authentication): Map<YearMonth, AggregationPersonApi?> {
        val now = LocalDate.now()
        val person =
            personService.findByUserCode(authentication.name) ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return (0..12).associate {
            val month = YearMonth.from(now.minusMonths(it.toLong()))
            month to aggregationService.totalPerPerson(month.atDay(1), month.atEndOfMonth(), person).produce()
        }
    }

    @GetMapping("/total-per-person", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerPersonByYear(
        @RequestParam year: Int,
    ): List<AggregationPerson> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerPerson(from, to)
    }

    @GetMapping("/total-per-person", params = ["year", "month"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerPersonByYearMonth(
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): List<AggregationPerson> {
        val yearMonth = YearMonth.of(year, month)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        return aggregationService.totalPerPerson(from, to)
    }

    @GetMapping("/total-per-month", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun totalsPerMonthByYear(
        @RequestParam year: Int,
    ): List<AggregationMonth> {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return aggregationService.totalPerMonth(from, to)
    }

    @GetMapping("/leave-day-report", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun leaveDayReportByYear(
        @RequestParam year: Int,
    ): List<AggregationLeaveDayApi> {
        return aggregationService.leaveDayReport(year).map { it.produce() }
    }

    // TODO: refactor the leave-day-report-me into new endpoint: holiday-details-me
    @GetMapping("/leave-day-report-me", params = ["year"])
    @PreAuthorize("isAuthenticated()")
    fun leaveDayReportMeByYear(
        authentication: Authentication,
        @RequestParam year: Int,
    ): AggregationLeaveDayApi {
        val person =
            personService.findByUserCode(authentication.name) ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return aggregationService.leaveDayReportMe(year, person)
            .produce()
    }

    @GetMapping("/client-hour-overview", params = ["year", "month"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun hourClientOverviewEmployee(
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): List<AggregationClientPersonOverviewApi> {
        val yearMonth = YearMonth.of(year, month)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        return aggregationService.clientPersonHourOverview(from, to).map(AggregationClientPersonOverview::produce)
    }

    @GetMapping("/client-assignment-hour-overview", params = ["from", "to"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun hourAssignmentClientOverviewEmployee(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): List<AggregationClientPersonAssignmentOverviewApi> {
        return aggregationService.clientPersonAssignmentHourOverview(from, to).map(
            AggregationClientPersonAssignmentOverview::produce,
        )
    }

    @GetMapping("/person-nonproductive-hours-per-day")
    @PreAuthorize("isAuthenticated()")
    fun personNonProductiveHoursPerDay(
        @RequestParam personId: String,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): ResponseEntity<List<NonProductiveHoursApi>> =
        (
            personService.findByUuid(UUID.fromString(personId))?.let { person ->
                aggregationService.personNonProductiveHoursPerDay(person, from, to)
                    .map(AggregationService.NonProductiveHours::produce)
            } ?: emptyList()
        ).toResponse()

    // TODO: refactor the leave-day-report-me into this new endpoint
    @GetMapping("/holiday-details-me", params = ["year"])
    @PreAuthorize("isAuthenticated()")
    fun holidayDetailsMeYear(
        authentication: Authentication,
        @RequestParam year: Int,
    ): PersonHolidayDetailsApi {
        val person =
            personService.findByUserCode(authentication.name) ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return aggregationService.getHolidayDetailsMe(year, person).produce()
    }
}

private fun AggregationLeaveDay.produce() =
    AggregationLeaveDayApi(
        name = name,
        contractHours = contractHours.produce(),
        plusHours = plusHours.produce(),
        holidayHours = holidayHours.produce(),
        paidParentalLeaveHours = paidParentalLeaveHours.produce(),
        unpaidParentalLeaveHours = unpaidParentalLeaveHours.produce(),
    )

private fun PersonHolidayDetails.produce() =
    PersonHolidayDetailsApi(
        name = name,
        holidayHoursFromContract = holidayHoursDone.produce(),
        plusHours = plusHours.produce(),
        holidayHoursDone = holidayHoursDone.produce(),
        holidayHoursApproved = holidayHoursApproved.produce(),
        holidayHoursRequested = holidayHoursRequested.produce(),
        totalHoursAvailable = totalHoursAvailable.produce(),
        totalHoursUsed = totalHoursUsed.produce(),
        totalHoursRemaining = totalHoursRemaining.produce(),
    )

private fun AggregationService.NonProductiveHours.produce() =
    NonProductiveHoursApi(
        sickHours = sickHours,
        holidayHours = holidayHours,
        paidParentalLeaveHours = paidParentalLeaveHours,
        unpaidParentalLeaveHours = unpaidParentalLeaveHours,
    )

private fun AggregationClientPersonAssignmentOverview.produce() =
    AggregationClientPersonAssignmentOverviewApi(
        client = client.produce(),
        aggregationPersonAssignment = aggregationPersonAssignment.map(AggregationClientPersonAssignmentItem::produce),
        totals = totals.map(Float::toDouble),
    )

private fun AggregationClientPersonAssignmentItem.produce() =
    AggregationClientPersonAssignmentItemApi(
        person = person.produce(),
        assignment = assignment.produce(),
        hours = hours.map(Float::produce),
        total = total.produce(),
    )

private fun AggregationPerson.produce() =
    AggregationPersonApi(
        id = id.produce(),
        name = name,
        contractTypes = contractTypes.toList(),
        sickDays = sickDays.produce(),
        workDays = workDays.produce(),
        assignment = assignment.produce(),
        event = event.produce(),
        total = total.produce(),
        leaveDayUsed = leaveDayUsed.produce(),
        leaveDayBalance = leaveDayBalance.produce(),
        paidParentalLeaveUsed = paidParentalLeaveUsed.produce(),
        unpaidParentalLeaveUsed = unpaidParentalLeaveUsed.produce(),
        revenue =
            revenue?.let {
                AggregationPersonClientRevenueOverviewApi(
                    clients = it.clients.produce(),
                    total = it.total.produce(),
                )
            },
        cost = cost?.produce(),
    )

private fun List<AggregationPersonClientRevenueItem>.produce(): List<AggregationPersonClientRevenueItemApi> =
    map {
        AggregationPersonClientRevenueItemApi(
            client = it.client.produce(),
            revenue = it.revenue.produce(),
        )
    }

private fun AggregationClient.produce(): AggregationClientApi =
    AggregationClientApi(
        name = name,
        revenueGross = revenueGross.produce(),
    )

private fun AggregationClientPersonOverview.produce() =
    AggregationClientPersonOverviewApi(
        client = client.produce(),
        aggregationPerson =
            aggregationPerson.map { personItem ->
                AggregationClientPersonItemApi(
                    personItem.person.produce(),
                    personItem.hours.map(Float::produce),
                    personItem.total.produce(),
                )
            },
        totals = totals.map(Float::produce),
    )

private fun BigDecimal.produce(): Double = toDouble()

private fun Float.produce(): Double = toDouble()

private fun Int.produce(): Double = toDouble()

private fun AggregationIdentifier.produce() = AggregationIdentifierApi(id, name)
