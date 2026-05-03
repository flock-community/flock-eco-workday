package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.HackDayReportByYear
import community.flock.eco.workday.api.endpoint.HackdayDetailsMeYear
import community.flock.eco.workday.api.endpoint.HolidayDetailsMeYear
import community.flock.eco.workday.api.endpoint.HourAssignmentClientOverviewEmployee
import community.flock.eco.workday.api.endpoint.HourClientOverviewEmployee
import community.flock.eco.workday.api.endpoint.LeaveDayReportByYear
import community.flock.eco.workday.api.endpoint.PersonNonProductiveHoursPerDay
import community.flock.eco.workday.api.endpoint.RevenuePerClientByYear
import community.flock.eco.workday.api.endpoint.TotalsPerMonthByYear
import community.flock.eco.workday.api.endpoint.TotalsPerPersonByYear_1
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
import org.springframework.http.HttpStatus
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.web.bind.annotation.GetMapping
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
import community.flock.eco.workday.api.model.AggregationMonth as AggregationMonthApi
import community.flock.eco.workday.api.model.AggregationPerson as AggregationPersonApi
import community.flock.eco.workday.api.model.AggregationPersonClientRevenueItem as AggregationPersonClientRevenueItemApi
import community.flock.eco.workday.api.model.AggregationPersonClientRevenueOverview as AggregationPersonClientRevenueOverviewApi
import community.flock.eco.workday.api.model.NonProductiveHours as NonProductiveHoursApi
import community.flock.eco.workday.api.model.PersonHackdayDetails as PersonHackdayDetailsApi
import community.flock.eco.workday.api.model.PersonHolidayDetails as PersonHolidayDetailsApi

interface AggregationHandler :
    RevenuePerClientByYear.Handler,
    TotalsPerPersonByYear_1.Handler,
    TotalsPerMonthByYear.Handler,
    LeaveDayReportByYear.Handler,
    HackDayReportByYear.Handler,
    HourClientOverviewEmployee.Handler,
    HourAssignmentClientOverviewEmployee.Handler,
    PersonNonProductiveHoursPerDay.Handler,
    HolidayDetailsMeYear.Handler,
    HackdayDetailsMeYear.Handler

@RestController
class AggregationController(
    private val personService: PersonService,
    private val aggregationService: AggregationService,
) : AggregationHandler {
    private fun authentication(): Authentication = SecurityContextHolder.getContext().authentication

    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    override suspend fun revenuePerClientByYear(request: RevenuePerClientByYear.Request): RevenuePerClientByYear.Response<*> {
        val year = request.queries.year
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return RevenuePerClientByYear.Response200(
            aggregationService.totalPerClient(from, to).map(AggregationClient::produce),
        )
    }

    @GetMapping("/api/aggregations/total-per-person-me")
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

    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    override suspend fun totalsPerPersonByYear_1(request: TotalsPerPersonByYear_1.Request): TotalsPerPersonByYear_1.Response<*> {
        val year = request.queries.year
        val month = request.queries.month
        val (from, to) =
            when (month) {
                null -> LocalDate.of(year, 1, 1) to LocalDate.of(year, 12, 31)
                else -> YearMonth.of(year, month).let { it.atDay(1) to it.atEndOfMonth() }
            }
        return TotalsPerPersonByYear_1.Response200(
            aggregationService.totalPerPerson(from, to).map(AggregationPerson::produce),
        )
    }

    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    override suspend fun totalsPerMonthByYear(request: TotalsPerMonthByYear.Request): TotalsPerMonthByYear.Response<*> {
        val year = request.queries.year
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        return TotalsPerMonthByYear.Response200(
            aggregationService.totalPerMonth(from, to).map(AggregationMonth::produce),
        )
    }

    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    override suspend fun leaveDayReportByYear(request: LeaveDayReportByYear.Request): LeaveDayReportByYear.Response<*> =
        LeaveDayReportByYear.Response200(
            aggregationService.leaveDayReport(request.queries.year).map { it.produce() },
        )

    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    override suspend fun hackDayReportByYear(request: HackDayReportByYear.Request): HackDayReportByYear.Response<*> =
        HackDayReportByYear.Response200(
            aggregationService.hackdayReport(request.queries.year).map { it.produce() },
        )

    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    override suspend fun hourClientOverviewEmployee(
        request: HourClientOverviewEmployee.Request,
    ): HourClientOverviewEmployee.Response<*> {
        val yearMonth = YearMonth.of(request.queries.year, request.queries.month)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        return HourClientOverviewEmployee.Response200(
            aggregationService.clientPersonHourOverview(from, to).map(AggregationClientPersonOverview::produce),
        )
    }

    @PreAuthorize("hasAuthority('AggregationAuthority.READ')")
    override suspend fun hourAssignmentClientOverviewEmployee(
        request: HourAssignmentClientOverviewEmployee.Request,
    ): HourAssignmentClientOverviewEmployee.Response<*> {
        val from = LocalDate.parse(request.queries.from)
        val to = LocalDate.parse(request.queries.to)
        return HourAssignmentClientOverviewEmployee.Response200(
            aggregationService
                .clientPersonAssignmentHourOverview(from, to)
                .map(AggregationClientPersonAssignmentOverview::produce),
        )
    }

    @PreAuthorize("isAuthenticated()")
    override suspend fun personNonProductiveHoursPerDay(
        request: PersonNonProductiveHoursPerDay.Request,
    ): PersonNonProductiveHoursPerDay.Response<*> {
        val personId = UUID.fromString(request.queries.personId)
        val from = LocalDate.parse(request.queries.from)
        val to = LocalDate.parse(request.queries.to)
        val body =
            personService.findByUuid(personId)?.let { person ->
                aggregationService
                    .personNonProductiveHoursPerDay(person, from, to)
                    .map(AggregationService.NonProductiveHours::produce)
            } ?: emptyList()
        return PersonNonProductiveHoursPerDay.Response200(body)
    }

    @PreAuthorize("isAuthenticated()")
    override suspend fun holidayDetailsMeYear(request: HolidayDetailsMeYear.Request): HolidayDetailsMeYear.Response<*> {
        val person =
            personService.findByUserCode(authentication().name)
                ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return HolidayDetailsMeYear.Response200(
            aggregationService.getHolidayDetailsMe(request.queries.year, person).produce(),
        )
    }

    @PreAuthorize("isAuthenticated()")
    override suspend fun hackdayDetailsMeYear(request: HackdayDetailsMeYear.Request): HackdayDetailsMeYear.Response<*> {
        val person =
            personService.findByUserCode(authentication().name)
                ?: throw ResponseStatusException(HttpStatus.FORBIDDEN)
        return HackdayDetailsMeYear.Response200(
            aggregationService.getHackdayDetailsMe(year = request.queries.year, person = person).produce(),
        )
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

private fun AggregationMonth.produce(): AggregationMonthApi =
    AggregationMonthApi(
        yearMonth = yearMonth,
        countContractInternal = countContractInternal,
        countContractManagement = countContractManagement,
        countContractExternal = countContractExternal,
        forecastRevenueGross = forecastRevenueGross.produce(),
        forecastRevenueNet = forecastRevenueNet.produce(),
        forecastHoursGross = forecastHoursGross.produce(),
        actualRevenue = actualRevenue.produce(),
        actualHours = actualHours.produce(),
        actualCostContractInternal = actualCostContractInternal.produce(),
        actualCostContractExternal = actualCostContractExternal.produce(),
        actualCostContractManagement = actualCostContractManagement.produce(),
        actualCostContractService = actualCostContractService.produce(),
        actualRevenueInternal = actualRevenueInternal.produce(),
        actualRevenueExternal = actualRevenueExternal.produce(),
        actualRevenueManagement = actualRevenueManagement.produce(),
    )

private fun BigDecimal.produce(): Double = toDouble()

private fun Float.produce(): Double = toDouble()

private fun Int.produce(): Double = toDouble()

private fun AggregationIdentifier.produce() = AggregationIdentifierApi(id, name)
