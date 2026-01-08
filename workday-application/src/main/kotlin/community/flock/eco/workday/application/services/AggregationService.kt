package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.ApplicationConstants
import community.flock.eco.workday.application.interfaces.Period
import community.flock.eco.workday.application.interfaces.filterInRange
import community.flock.eco.workday.application.interfaces.inRange
import community.flock.eco.workday.application.model.AggregationClient
import community.flock.eco.workday.application.model.AggregationClientPersonAssignmentItem
import community.flock.eco.workday.application.model.AggregationClientPersonAssignmentOverview
import community.flock.eco.workday.application.model.AggregationClientPersonItem
import community.flock.eco.workday.application.model.AggregationClientPersonOverview
import community.flock.eco.workday.application.model.AggregationHackDay
import community.flock.eco.workday.application.model.AggregationIdentifier
import community.flock.eco.workday.application.model.AggregationLeaveDay
import community.flock.eco.workday.application.model.AggregationMonth
import community.flock.eco.workday.application.model.AggregationPerson
import community.flock.eco.workday.application.model.AggregationPersonClientRevenueItem
import community.flock.eco.workday.application.model.AggregationPersonClientRevenueOverview
import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.ContractExternal
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.model.ContractManagement
import community.flock.eco.workday.application.model.ContractService
import community.flock.eco.workday.application.model.Day
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.model.PersonHackdayDetails
import community.flock.eco.workday.application.model.PersonHolidayDetails
import community.flock.eco.workday.application.model.WorkDay
import community.flock.eco.workday.application.model.sumHoursWithinAPeriod
import community.flock.eco.workday.application.utils.DateUtils.countWorkDaysInMonth
import community.flock.eco.workday.application.utils.DateUtils.dateRange
import community.flock.eco.workday.application.utils.DateUtils.isWorkingDay
import community.flock.eco.workday.application.utils.DateUtils.toDateRange
import community.flock.eco.workday.application.utils.NumericUtils.calculateRevenue
import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.domain.common.Status
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.BigInteger
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit

@Service
class AggregationService(
    private val clientService: ClientService,
    private val assignmentService: AssignmentService,
    private val dataService: DataService,
    private val applicationConstants: ApplicationConstants,
    private val workDayService: WorkDayService,
    private val leaveDayService: LeaveDayService,
    private val sickDayService: SickDayService,
) {
    fun getHolidayDetailsMe(
        year: Int,
        person: Person,
    ): PersonHolidayDetails {
        val from = YearMonth.of(year, 1).atDay(1)
        val to = YearMonth.of(year, 12).atEndOfMonth()
        val period = FromToPeriod(from, to)
        val data = dataService.findAllData(from, to, person.uuid)
        return PersonHolidayDetails(
            name = person.getFullName(),
            holidayHoursFromContract =
                data.contract
                    .filterIsInstance<ContractInternal>()
                    .map { it.totalLeaveDayHoursInPeriod(period) }
                    .sum(),
            plusHours =
                data.leaveDay
                    .filter { it.type == LeaveDayType.PLUSDAY }
                    .filter { it.status in setOf(Status.DONE, Status.APPROVED) }
                    .totalHoursInPeriod(from, to),
            holidayHoursDone =
                data.leaveDay
                    .filter { it.type == LeaveDayType.HOLIDAY }
                    .filter { it.status === Status.DONE }
                    .totalHoursInPeriod(from, to),
            holidayHoursApproved =
                data.leaveDay
                    .filter { it.type == LeaveDayType.HOLIDAY }
                    .filter { it.status === Status.APPROVED }
                    .totalHoursInPeriod(from, to),
            holidayHoursRequested =
                data.leaveDay
                    .filter { it.type == LeaveDayType.HOLIDAY }
                    .filter { it.status === Status.REQUESTED }
                    .totalHoursInPeriod(from, to),
        )
    }

    fun getHackdayDetailsMe(
        year: Int,
        person: Person,
    ): PersonHackdayDetails {
        val from = YearMonth.of(year, 1).atDay(1)
        val to = YearMonth.of(year, 12).atEndOfMonth()
        val period = FromToPeriod(from, to)
        val data = dataService.findAllData(from, to, person.uuid)
        return PersonHackdayDetails(
            name = person.getFullName(),
            hackHoursFromContract =
                data.contract
                    .filterIsInstance<ContractInternal>()
                    .map { it.totalHackDayHoursInPeriod(period) }
                    .sum(),
            hackHoursUsed =
                data.eventDay
                    .filter { it.type == EventType.FLOCK_HACK_DAY }
                    .sumOf { it.hours }
                    .toBigDecimal(),
        )
    }

    fun leaveDayReport(year: Int): List<AggregationLeaveDay> {
        val from = YearMonth.of(year, 1).atDay(1)
        val to = YearMonth.of(year, 12).atEndOfMonth()
        val period = FromToPeriod(from, to)
        val all = dataService.findAllData(from, to)
        return all
            .allPersons()
            .map { person ->
                AggregationLeaveDay(
                    name = person.getFullName(),
                    contractHours =
                        all.contract
                            .filterIsInstance<ContractInternal>()
                            .filter { it.person == person }
                            .map { it.totalLeaveDayHoursInPeriod(period) }
                            .sum(),
                    plusHours =
                        all.leaveDay
                            .filter { it.type == LeaveDayType.PLUSDAY }
                            .filter { it.person == person }
                            .totalHoursInPeriod(from, to),
                    holidayHours =
                        all.leaveDay
                            .filter { it.type == LeaveDayType.HOLIDAY }
                            .filter { it.person == person }
                            .totalHoursInPeriod(from, to),
                    paidParentalLeaveHours =
                        all.leaveDay
                            .filter { it.person == person }
                            .filter { it.type == LeaveDayType.PAID_PARENTAL_LEAVE }
                            .totalHoursInPeriod(from, to),
                    unpaidParentalLeaveHours =
                        all.leaveDay
                            .filter { it.person == person }
                            .filter { it.type == LeaveDayType.UNPAID_PARENTAL_LEAVE }
                            .totalHoursInPeriod(from, to),
                    paidLeaveHours =
                        all.leaveDay
                            .filter { it.person == person }
                            .filter { it.type == LeaveDayType.PAID_LEAVE }
                            .totalHoursInPeriod(from, to),
                )
            }
    }

    fun hackdayReport(year: Int): List<AggregationHackDay> {
        val from = YearMonth.of(year, 1).atDay(1)
        val to = YearMonth.of(year, 12).atEndOfMonth()
        val period = FromToPeriod(from, to)
        val all = dataService.findAllData(from, to)
        return all
            .allPersons()
            .map { person ->
                AggregationHackDay(
                    name = person.getFullName(),
                    contractHours =
                        all.contract
                            .filterIsInstance<ContractInternal>()
                            .filter { it.person == person }
                            .map { it.totalHackDayHoursInPeriod(period) }
                            .sum(),
                    usedHours =
                        all.eventDay
                            .filter { it.type == EventType.FLOCK_HACK_DAY }
                            .filter { person in it.persons }
                            .sumOf { it.hours }
                            .toBigDecimal(),
                )
            }
    }

    fun totalPerClient(
        from: LocalDate,
        to: LocalDate,
    ): List<AggregationClient> {
        val allAssignments = assignmentService.findAllActive(from, to)
        return clientService
            .findAll()
            .map { client ->
                AggregationClient(
                    name = client.name,
                    revenueGross =
                        allAssignments
                            .filter { it.client == client }
                            .toMapWorkingDay(from, to)
                            .values
                            .flatten()
                            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() },
                )
            }
    }

    fun totalPerPerson(
        from: LocalDate,
        to: LocalDate,
        person: Person,
    ): AggregationPerson {
        val allData = dataService.findAllData(from, to, person.uuid)
        val totalWorkDays = countWorkDaysInPeriod(from, to)
        val period = FromToPeriod(from, to)
        return AggregationPerson(
            id = person.uuid,
            name = person.getFullName(),
            contractTypes =
                allData.contract
                    .mapNotNull { it::class.simpleName }
                    .toSet(),
            sickDays =
                allData.sickDay
                    .toList()
                    .totalHoursInPeriod(from, to),
            workDays =
                allData.workDay
                    .toList()
                    .totalHoursInPeriod(from, to),
            assignment =
                allData.assignment
                    .toList()
                    .toMapWorkingDay(from, to)
                    .values
                    .flatten()
                    .fold(0) { acc, cur -> acc + cur.hoursPerWeek }
                    .div(5),
            event =
                allData.eventDay
                    .map { it.totalHoursInPeriod(period) }
                    .sum()
                    .toInt(),
            total =
                allData.contract
                    .sumHoursWithinAPeriod(from, to),
            leaveDayUsed =
                allData.leaveDay
                    .filter { it.type == LeaveDayType.HOLIDAY }
                    .totalHoursInPeriod(from, to),
            leaveDayBalance =
                allData.contract
                    .filterIsInstance<ContractInternal>()
                    .mapWorkingDay(from, to)
                    .map { BigDecimal(it.hoursPerWeek * 24 * 8) }
                    .sum()
                    .divide(BigDecimal(totalWorkDays * 40), 10, RoundingMode.HALF_UP),
            paidParentalLeaveUsed =
                allData.leaveDay
                    .filter { it.type == LeaveDayType.PAID_PARENTAL_LEAVE }
                    .totalHoursInPeriod(from, to),
            unpaidParentalLeaveUsed =
                allData.leaveDay
                    .filter { it.type == LeaveDayType.UNPAID_PARENTAL_LEAVE }
                    .totalHoursInPeriod(from, to),
        )
    }

    fun totalPerPerson(yearMonth: YearMonth) = totalPerPerson(yearMonth.atDay(1), yearMonth.atEndOfMonth())

    fun totalPerPerson(
        from: LocalDate,
        to: LocalDate,
    ): List<AggregationPerson> {
        val all = dataService.findAllData(from, to)
        val totalWorkDays = countWorkDaysInPeriod(from, to)
        val period = FromToPeriod(from, to)
        return all
            .allPersons()
            .sortedBy { it.lastname }
            .map { person ->
                AggregationPerson(
                    id = person.uuid,
                    name = person.getFullName(),
                    contractTypes =
                        all.contract
                            .filter { it.person == person }
                            .mapNotNull { it::class.simpleName }
                            .toSet(),
                    sickDays = all.sickDay.filter { it.person == person }.totalHoursInPeriod(from, to),
                    workDays = all.workDay.filter { it.assignment.person == person }.totalHoursInPeriod(from, to),
                    assignment =
                        all.assignment
                            .filter { it.person == person }
                            .toMapWorkingDay(from, to)
                            .values
                            .flatten()
                            .fold(0) { acc, cur -> acc + cur.hoursPerWeek }
                            .div(5),
                    event =
                        all.eventDay
                            .filter { it.persons.isEmpty() || it.persons.contains(person) }
                            .map { it.totalHoursInPeriod(period) }
                            .sum()
                            .toInt(),
                    total =
                        all.contract
                            .filter { it.person == person }
                            .sumHoursWithinAPeriod(from, to),
                    leaveDayUsed =
                        all.leaveDay
                            .filter { it.type == LeaveDayType.HOLIDAY }
                            .filter { it.person == person }
                            .totalHoursInPeriod(from, to),
                    leaveDayBalance =
                        all.contract
                            .filter { it.person == person }
                            .filterIsInstance(ContractInternal::class.java)
                            .mapWorkingDay(from, to)
                            .map { BigDecimal(it.hoursPerWeek * 24 * 8) }
                            .sum()
                            .divide(BigDecimal(totalWorkDays * 40), 10, RoundingMode.HALF_UP),
                    paidParentalLeaveUsed =
                        all.leaveDay
                            .filter { it.type == LeaveDayType.PAID_PARENTAL_LEAVE }
                            .filter { it.person == person }
                            .totalHoursInPeriod(from, to),
                    unpaidParentalLeaveUsed =
                        all.leaveDay
                            .filter { it.type == LeaveDayType.UNPAID_PARENTAL_LEAVE }
                            .filter { it.person == person }
                            .totalHoursInPeriod(from, to),
                    revenue =
                        personClientRevenueOverview(all.workDay, from, to)
                            .filter { it.key.id == person.id.toString() }
                            .values
                            .firstOrNull(),
                    cost =
                        all.contract
                            .filter { it.person == person }
                            .map { it.totalCostsInPeriod(from, to) }
                            .sum(),
                )
            }
    }

    fun totalPerMonth(yearMonth: YearMonth): List<AggregationMonth> = totalPerMonth(yearMonth.atDay(1), yearMonth.atEndOfMonth())

    fun totalPerMonth(
        from: LocalDate,
        to: LocalDate,
    ): List<AggregationMonth> {
        val all = dataService.findAllData(from, to)
        val months =
            (0..ChronoUnit.MONTHS.between(from, to))
                .map { from.plusMonths(it) }
                .map { YearMonth.from(it) }

        fun contractTypes(
            person: Person,
            yearMonth: YearMonth,
        ) = all.contract
            .filter { (it is ContractInternal && it.billable) || (it is ContractExternal && it.billable) || it is ContractManagement }
            .filter { it.person == person }
            .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
            .map { it::class.java }
            .toSet()

        return months
            .map { yearMonth ->
                AggregationMonth(
                    yearMonth = yearMonth.toString(),
                    countContractInternal =
                        all.contract
                            .filterIsInstance<ContractInternal>()
                            .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
                            .filter { it.billable }
                            .distinctBy { it.person?.id }
                            .count(),
                    countContractExternal =
                        all.contract
                            .filterIsInstance<ContractExternal>()
                            .filter { it.billable }
                            .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
                            .distinctBy { it.person?.id }
                            .count(),
                    countContractManagement =
                        all.contract
                            .filterIsInstance<ContractManagement>()
                            .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
                            .distinctBy { it.person?.id }
                            .count(),
                    forecastRevenueGross =
                        all.assignment
                            .mapWorkingDay(yearMonth)
                            .sumAmount(yearMonth),
                    forecastRevenueNet =
                        all.assignment
                            .mapWorkingDay(yearMonth)
                            .sumAmount(yearMonth)
                            .multiply(netRevenueFactor(from, to)),
                    forecastHoursGross =
                        all.assignment
                            .mapWorkingDay(yearMonth)
                            .sumAssignmentHoursPerWeek()
                            .divide(yearMonth.countWorkDaysInMonth().times(5).toBigDecimal(), 10, RoundingMode.HALF_UP),
                    actualRevenue =
                        all.workDay
                            .map { it.totalRevenueInPeriod(yearMonth) }
                            .sum(),
                    actualRevenueInternal =
                        all.workDay
                            .filter {
                                contractTypes(
                                    it.assignment.person,
                                    yearMonth,
                                ).contains(ContractInternal::class.java)
                            }.map { it.totalRevenueInPeriod(yearMonth) }
                            .sum(),
                    actualRevenueExternal =
                        all.workDay
                            .filter {
                                contractTypes(
                                    it.assignment.person,
                                    yearMonth,
                                ).contains(ContractExternal::class.java)
                            }.map { it.totalRevenueInPeriod(yearMonth) }
                            .sum(),
                    actualRevenueManagement =
                        all.workDay
                            .filter {
                                contractTypes(
                                    it.assignment.person,
                                    yearMonth,
                                ).contains(ContractManagement::class.java)
                            }.map { it.totalRevenueInPeriod(yearMonth) }
                            .sum(),
                    actualHours =
                        all.workDay
                            .map { it.totalHoursInPeriod(yearMonth) }
                            .sum()
                            .divide(yearMonth.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP),
                    actualCostContractInternal =
                        all.contract
                            .filterIsInstance(ContractInternal::class.java)
                            .map { it.totalCostInPeriod(yearMonth) }
                            .sum(),
                    actualCostContractExternal =
                        yearMonth
                            .toDateRange()
                            .flatMap { date ->
                                cartesianProducts(
                                    all.contract.filterIsInstance(ContractExternal::class.java),
                                    all.workDay,
                                ).filter { (contract) -> contract.billable }
                                    .filter { (contract, workDay) -> contract.person == workDay.assignment.person }
                                    .filter { (contract, workDay) -> contract.inRange(date) && workDay.inRange(date) }
                                    .map { (contract, workDay) ->
                                        contract.hourlyRate.toBigDecimal() * workDay.hoursPerDay().getValue(date)
                                    }
                            }.sum(),
                    actualCostContractManagement =
                        all.contract
                            .filterIsInstance(ContractManagement::class.java)
                            .map { it.totalCostInPeriod(yearMonth) }
                            .sum(),
                    actualCostContractService =
                        all.contract
                            .filterIsInstance(ContractService::class.java)
                            .map { it.totalCostInPeriod(yearMonth) }
                            .sum(),
                )
            }
    }

    fun clientPersonHourOverview(
        from: LocalDate,
        to: LocalDate,
    ): List<AggregationClientPersonOverview> =
        workDayService
            .findAllActive(from, to)
            .groupBy {
                it.assignment.client
            }.mapValues { (_, workDays) ->
                val clientPersonItems =
                    workDays.map { workDay ->
                        val person =
                            AggregationIdentifier(
                                id =
                                    workDay.assignment.person.id
                                        .toString(),
                                name = workDay.assignment.person.getFullName(),
                            )
                        val workingHoursPerDay =
                            workDay
                                .hoursPerDayInPeriod(from, to)
                                .map { it.value.toFloat() }

                        AggregationClientPersonItem(
                            person = person,
                            hours = workingHoursPerDay,
                            total = workingHoursPerDay.sum(),
                        )
                    }
                clientPersonItems
                    .groupBy { it.person }
                    .mapValues { (person, values) ->
                        val hours =
                            values
                                .map {
                                    it.hours
                                }.sumAtIndex()
                        val total = hours.sum()
                        AggregationClientPersonItem(
                            person = person,
                            hours = hours,
                            total = total,
                        )
                    }.map {
                        it.value
                    }
            }.map { (client, clientPersonItems) ->
                AggregationClientPersonOverview(
                    client = AggregationIdentifier(id = client.id.toString(), name = client.name),
                    aggregationPerson = clientPersonItems,
                    totals =
                        clientPersonItems
                            .map { it.hours }
                            .sumAtIndex(),
                )
            }

    fun clientPersonAssignmentHourOverview(
        from: LocalDate,
        to: LocalDate,
    ): List<AggregationClientPersonAssignmentOverview> =
        workDayService
            .findAllActive(from, to)
            .groupBy {
                it.assignment.client
            }.mapValues { (_, workDays) ->
                val clientPersonItems =
                    workDays.map { workDay ->
                        val person =
                            AggregationIdentifier(
                                id =
                                    workDay.assignment.person.uuid
                                        .toString(),
                                name = workDay.assignment.person.getFullName(),
                            )
                        val workingHoursPerDay =
                            workDay
                                .hoursPerDayInPeriod(from, to)
                                .map { it.value.toFloat() }

                        val assignment =
                            AggregationIdentifier(
                                id = workDay.assignment.id.toString(),
                                name = workDay.assignment.role ?: "Unknown",
                            )

                        AggregationClientPersonAssignmentItem(
                            person = person,
                            assignment = assignment,
                            hours = workingHoursPerDay,
                            total = workingHoursPerDay.sum(),
                        )
                    }
                clientPersonItems
                    .groupBy { it.personAssignmentKey() }
                    .mapValues { (key, values) ->
                        val person = key.person
                        val assignment = key.assignment
                        val hours =
                            values
                                .map {
                                    it.hours
                                }.sumAtIndex()
                        val total = hours.sum()
                        AggregationClientPersonAssignmentItem(
                            person = person,
                            assignment = assignment,
                            hours = hours,
                            total = total,
                        )
                    }.values
                    .sortedBy { it.person.name }
            }.map { (client, clientPersonAssignmentItems) ->
                AggregationClientPersonAssignmentOverview(
                    client = AggregationIdentifier(id = client.id.toString(), name = client.name),
                    aggregationPersonAssignment = clientPersonAssignmentItems,
                    totals =
                        clientPersonAssignmentItems
                            .map { it.hours }
                            .sumAtIndex(),
                )
            }.sortedBy { it.client.name }

    fun personClientRevenueOverview(
        workDays: Iterable<WorkDay>,
        from: LocalDate,
        to: LocalDate,
    ): MutableMap<AggregationIdentifier, AggregationPersonClientRevenueOverview> {
        val allWorkdays =
            workDays.groupBy {
                it.assignment.person
            }
        val revenueOverviewPerPerson = mutableMapOf<AggregationIdentifier, AggregationPersonClientRevenueOverview>()
        allWorkdays.forEach { (person: Person, values: List<WorkDay>) ->
            val personIdentifier =
                AggregationIdentifier(
                    id = person.id.toString(),
                    name = person.getFullName(),
                )
            val companyOverviews = mutableListOf<AggregationPersonClientRevenueItem>()
            values
                .groupBy {
                    it.assignment.client
                }.map { (client, workdays) ->
                    var revenueTotal = BigDecimal(BigInteger.ZERO)
                    workdays.map { workDay ->
                        val revenuePerWorkDay =
                            workDay
                                .hoursPerDayInPeriod(from, to)
                                .calculateRevenue(workDay.assignment.hourlyRate)
                        revenueTotal = revenueTotal.plus(revenuePerWorkDay)
                    }
                    companyOverviews.add(
                        AggregationPersonClientRevenueItem(
                            client =
                                AggregationIdentifier(
                                    id = client.id.toString(),
                                    name = client.name,
                                ),
                            revenue = revenueTotal,
                        ),
                    )
                }
            val aggregationClientOverview =
                AggregationPersonClientRevenueOverview(
                    clients = companyOverviews,
                    total =
                        companyOverviews
                            .map { it.revenue }
                            .sum(),
                )
            revenueOverviewPerPerson[personIdentifier] = aggregationClientOverview
        }
        return revenueOverviewPerPerson
    }

    fun personNonProductiveHoursPerDay(
        person: Person,
        from: LocalDate,
        to: LocalDate,
    ): List<NonProductiveHours> {
        val leaveDayData = leaveDayService.findAllActiveByPerson(from, to, person.uuid)
        val holidays =
            leaveDayData
                .filter { it.type == LeaveDayType.HOLIDAY }
                .map { it.hoursPerDayInPeriod(from, to) }
                .fold(emptyMap<LocalDate, BigDecimal>()) { acc, item -> acc.merge(item) }
        val sickdays =
            sickDayService
                .findAllActiveByPerson(from, to, person.uuid)
                .map { it.hoursPerDayInPeriod(from, to) }
                .fold(emptyMap<LocalDate, BigDecimal>()) { acc, item -> acc.merge(item) }
        val paidParentalLeave =
            leaveDayData
                .filter { it.type == LeaveDayType.PAID_PARENTAL_LEAVE }
                .map { it.hoursPerDayInPeriod(from, to) }
                .fold(emptyMap<LocalDate, BigDecimal>()) { acc, item -> acc.merge(item) }
        val unpaidParentalLeave =
            leaveDayData
                .filter { it.type == LeaveDayType.UNPAID_PARENTAL_LEAVE }
                .map { it.hoursPerDayInPeriod(from, to) }
                .fold(emptyMap<LocalDate, BigDecimal>()) { acc, item -> acc.merge(item) }
        val paidLeave =
            leaveDayData
                .filter { it.type == LeaveDayType.PAID_LEAVE }
                .map { it.hoursPerDayInPeriod(from, to) }
                .fold(emptyMap<LocalDate, BigDecimal>()) { acc, item -> acc.merge(item) }

        val map =
            from.datesUntil(to.plusDays(1)).toList().associateWith { date ->
                NonProductiveHours(
                    sickHours = sickdays[date]?.toDouble() ?: 0.0,
                    holidayHours = holidays[date]?.toDouble() ?: 0.0,
                    paidParentalLeaveHours = paidParentalLeave[date]?.toDouble() ?: 0.0,
                    unpaidParentalLeaveHours = unpaidParentalLeave[date]?.toDouble() ?: 0.0,
                    paidLeaveHours = paidLeave[date]?.toDouble() ?: 0.0,
                )
            }

        return map.entries
            .sortedBy { it.key }
            .map { it.value }
            .toList()
    }

    fun Map<LocalDate, BigDecimal>.merge(other: Map<LocalDate, BigDecimal>): Map<LocalDate, BigDecimal> =
        (this.keys + other.keys).associateWith { date ->
            this.getOrDefault(date, BigDecimal.ZERO) + other.getOrDefault(date, BigDecimal.ZERO)
        }

    // TODO: Move this?
    data class NonProductiveHours(
        val sickHours: Double,
        val holidayHours: Double,
        val paidParentalLeaveHours: Double,
        val unpaidParentalLeaveHours: Double,
        val paidLeaveHours: Double,
    )

    fun Iterable<Iterable<Float>>.sumAtIndex() =
        this
            .reduce { acc, cur ->
                acc.zip(cur) { a, b -> a + b }
            }.toList()

    private fun List<Day>.totalHoursInPeriod(
        from: LocalDate,
        to: LocalDate,
    ) = this
        .map { day ->
            day
                .hoursPerDayInPeriod(from, to)
                .map { it.value }
                .sum()
        }.sum()

    private fun Data.allPersons(): Set<Person> =
        (
            this.assignment.map { it.person } +
                this.contract.map { it.person } +
                this.sickDay.map { it.person } +
                this.leaveDay.map { it.person } +
                this.workDay.map { it.assignment.person }
        ).filterNotNull()
            .toSet()

    fun netRevenueFactor(
        from: LocalDate,
        to: LocalDate,
    ): BigDecimal {
        val totalOffDays =
            listOf(
                applicationConstants.averageHoliDays,
                applicationConstants.averageSickDays,
                applicationConstants.averagePublicDays,
                applicationConstants.averageTrainingDays,
            ).map { it.toInt() }
                .sum()
                .toBigDecimal()
        val totalWorkDays = countWorkDaysInPeriod(from, to).toBigDecimal()
        return BigDecimal.ONE - totalOffDays.divide(totalWorkDays, 10, RoundingMode.HALF_UP)
    }
}

data class FromToPeriod(
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now(),
) : Period

private fun <T : Period> List<T>.toMapWorkingDay(
    from: LocalDate,
    to: LocalDate,
) = dateRange(from, to)
    .filterWorkingDay()
    .associateWith { date -> filter { it.inRange(date) } }

private fun Assignment.revenuePerDay(): BigDecimal =
    (this.hourlyRate * this.hoursPerWeek)
        .toBigDecimal()
        .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)

private fun Iterable<LocalDate>.filterWorkingDay() = this.filter { it.isWorkingDay() }

fun countWorkDaysInPeriod(
    from: LocalDate,
    to: LocalDate,
): Int {
    val diff = ChronoUnit.DAYS.between(from, to)
    return (0..diff)
        .map { from.plusDays(it) }
        .filterWorkingDay()
        .count()
}

private fun <T : Period> Iterable<T>.mapWorkingDay(
    from: LocalDate,
    to: LocalDate?,
) = dateRange(from, to)
    .filterWorkingDay()
    .flatMap { date -> this.filterInRange(date) }

private fun <T : Period> Iterable<T>.mapWorkingDay(yearMonth: YearMonth) =
    yearMonth
        .toDateRange()
        .filterWorkingDay()
        .flatMap { date -> this.filterInRange(date) }

private fun <T : Period> Iterable<T>.sumAmount(yearMonth: YearMonth) =
    this
        .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.amountPerWorkingDay(yearMonth) }

private fun Iterable<Assignment>.sumAssignmentHoursPerWeek() =
    this
        .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.hoursPerWeek.toBigDecimal() }

private fun <A, B> cartesianProducts(
    a_s: Iterable<A>,
    b_s: Iterable<B>,
) = a_s.flatMap { a -> b_s.map { b -> a to b } }

data class PersonAssignmentCompositeIdentifier(
    val person: AggregationIdentifier,
    val assignment: AggregationIdentifier,
)

private fun AggregationClientPersonAssignmentItem.personAssignmentKey() = PersonAssignmentCompositeIdentifier(person, assignment)
