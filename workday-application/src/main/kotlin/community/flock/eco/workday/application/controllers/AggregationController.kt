package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.model.AggregationClient
import community.flock.eco.workday.application.model.AggregationClientPersonAssignmentItem
import community.flock.eco.workday.application.model.AggregationClientPersonAssignmentOverview
import community.flock.eco.workday.application.model.AggregationClientPersonOverview
import community.flock.eco.workday.application.model.AggregationHackDay
import community.flock.eco.workday.application.model.AggregationIdentifier
import community.flock.eco.workday.application.model.AggregationLeaveDay
import community.flock.eco.workday.application.model.AggregationMonth
import community.flock.eco.workday.application.model.AggregationPerson
import community.flock.eco.workday.application.model.AggregationPersonClientRevenueItem
import community.flock.eco.workday.application.model.PersonHackdayDetails
import community.flock.eco.workday.application.model.PersonHolidayDetails
import community.flock.eco.workday.application.services.AggregationService
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.core.utils.toResponse
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
import community.flock.eco.workday.api.model.AggregationClient as AggregationClientApi
import community.flock.eco.workday.api.model.AggregationClientPersonAssignmentItem as AggregationClientPersonAssignmentItemApi
import community.flock.eco.workday.api.model.AggregationClientPersonAssignmentOverview as AggregationClientPersonAssignmentOverviewApi
import community.flock.eco.workday.api.model.AggregationClientPersonItem as AggregationClientPersonItemApi
import community.flock.eco.workday.api.model.AggregationClientPersonOverview as AggregationClientPersonOverviewApi
import community.flock.eco.workday.api.model.AggregationHackDay as AggregationHackDayApi
import community.flock.eco.workday.api.model.AggregationIdentifier as AggregationIdentifierApi
import community.flock.eco.workday.api.model.AggregationLeaveDay as AggregationLeaveDayApi
import community.flock.eco.workday.api.model.AggregationPerson as AggregationPersonApi
import community.flock.eco.workday.api.model.AggregationPersonClientRevenueItem as AggregationPersonClientRevenueItemApi
import community.flock.eco.workday.api.model.AggregationPersonClientRevenueOverview as AggregationPersonClientRevenueOverviewApi
import community.flock.eco.workday.api.model.NonProductiveHours as NonProductiveHoursApi
import community.flock.eco.workday.api.model.PersonHackdayDetails as PersonHackdayDetailsApi
import community.flock.eco.workday.api.model.PersonHolidayDetails as PersonHolidayDetailsApi

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
    ): List<AggregationLeaveDayApi> = aggregationService.leaveDayReport(year).map { it.produce() }

    @GetMapping("/hack-day-report", params = ["year"])
    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    fun hackDayReportByYear(
        @RequestParam year: Int,
    ): List<AggregationHackDayApi> = aggregationService.hackdayReport(year).map { it.produce() }

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
    ): List<AggregationClientPersonAssignmentOverviewApi> =
        aggregationService.clientPersonAssignmentHourOverview(from, to).map(
            AggregationClientPersonAssignmentOverview::produce,
        )

    @GetMapping("/person-nonproductive-hours-per-day")
    @PreAuthorize("isAuthenticated()")
    fun personNonProductiveHoursPerDay(
        @RequestParam personId: String,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate,
    ): ResponseEntity<List<NonProductiveHoursApi>> =
        (
            personService.findByUuid(UUID.fromString(personId))?.let { person ->
                aggregationService
                    .personNonProductiveHoursPerDay(person, from, to)
                    .map(AggregationService.NonProductiveHours::produce)
            } ?: emptyList()
        ).toResponse()

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

    @GetMapping("/hackday-details-me", params = ["year"])
    @PreAuthorize("isAuthenticated()")
    fun hackdayDetailsMeYear(
        authentication: Authentication,
        @RequestParam year: Int,
    ): PersonHackdayDetailsApi {
        val person =
            personService.findByUserCode(authentication.name) ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return aggregationService
            .getHackdayDetailsMe(
                year = year,
                person = person,
            ).produce()
    }
}

private fun AggregationHackDay.produce() =
    AggregationHackDayApi(
        name = name,
        contractHours = contractHours.produce(),
        hackHoursUsed = usedHours.produce(),
    )

private fun AggregationLeaveDay.produce() =
    AggregationLeaveDayApi(
        name = name,
        contractHours = contractHours.produce(),
        plusHours = plusHours.produce(),
        holidayHours = holidayHours.produce(),
        paidParentalLeaveHours = paidParentalLeaveHours.produce(),
        unpaidParentalLeaveHours = unpaidParentalLeaveHours.produce(),
        paidLeaveHours = paidLeaveHours.produce(),
    )

private fun PersonHolidayDetails.produce() =
    PersonHolidayDetailsApi(
        name = name,
        holidayHoursFromContract = holidayHoursFromContract.produce(),
        plusHours = plusHours.produce(),
        holidayHoursDone = holidayHoursDone.produce(),
        holidayHoursApproved = holidayHoursApproved.produce(),
        holidayHoursRequested = holidayHoursRequested.produce(),
        totalHoursAvailable = totalHoursAvailable.produce(),
        totalHoursUsed = totalHoursUsed.produce(),
        totalHoursRemaining = totalHoursRemaining.produce(),
    )

private fun PersonHackdayDetails.produce() =
    PersonHackdayDetailsApi(
        name = name,
        hackHoursFromContract = hackHoursFromContract.produce(),
        hackHoursUsed = hackHoursUsed.produce(),
        totalHoursRemaining = totalHoursRemaining.produce(),
    )

private fun AggregationService.NonProductiveHours.produce() =
    NonProductiveHoursApi(
        sickHours = sickHours,
        holidayHours = holidayHours,
        paidParentalLeaveHours = paidParentalLeaveHours,
        unpaidParentalLeaveHours = unpaidParentalLeaveHours,
        paidLeaveHours = paidLeaveHours,
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
        id = id.toString(),
        name = name,
        contractTypes = contractTypes.toList(),
        sickDays = sickDays.produce(),
        workDays = workDays.produce(),
        assignment = assignment,
        event = event,
        total = total,
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
