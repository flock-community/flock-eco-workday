package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.graphql.AggregationClientPersonAssignmentItem
import community.flock.eco.workday.graphql.AggregationClientPersonAssignmentOverview
import community.flock.eco.workday.graphql.AggregationClientPersonItem
import community.flock.eco.workday.graphql.AggregationClientPersonOverview
import community.flock.eco.workday.graphql.AggregationIdentifier
import community.flock.eco.workday.graphql.AggregationPersonClientRevenueItem
import community.flock.eco.workday.graphql.AggregationPersonClientRevenueOverview
import community.flock.eco.workday.interfaces.Dayly
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.interfaces.filterInRange
import community.flock.eco.workday.interfaces.inRange
import community.flock.eco.workday.model.AggregationClient
import community.flock.eco.workday.model.AggregationHoliday
import community.flock.eco.workday.model.AggregationMonth
import community.flock.eco.workday.model.AggregationPerson
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractManagement
import community.flock.eco.workday.model.Day
import community.flock.eco.workday.model.HolidayType
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.model.sumHoursWithinAPeriod
import community.flock.eco.workday.utils.DateUtils.countWorkDaysInMonth
import community.flock.eco.workday.utils.DateUtils.dateRange
import community.flock.eco.workday.utils.DateUtils.isWorkingDay
import community.flock.eco.workday.utils.DateUtils.toDateRange
import community.flock.eco.workday.utils.NumericUtils.calculateRevenue
import community.flock.eco.workday.utils.NumericUtils.sum
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.BigInteger
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import community.flock.eco.workday.model.ContractService as ContractServiceModel

@Service

class AggregationService(
    private val clientService: ClientService,
    private val assignmentService: AssignmentService,
    private val dataService: DataService,
    private val applicationConstants: ApplicationConstants,
    private val workDayService: WorkDayService,
    private val holiDayService: HoliDayService,
    private val sickDayService: SickDayService
) {

    fun holidayReportMe(year: Int, person: Person): AggregationHoliday {
        val from = YearMonth.of(year, 1).atDay(1)
        val to = YearMonth.of(year, 12).atEndOfMonth()
        val period = FromToPeriod(from, to)
        val data = dataService.findAllData(from, to, person.uuid)
        return AggregationHoliday(
            name = person.getFullName(),
            contractHours = data.contract
                .filterIsInstance(ContractInternal::class.java)
                .map { it.totalHolidayHoursInPeriod(period) }
                .sum(),
            plusHours = data.holiDay
                .filter { it.type == HolidayType.PLUSDAY }
                .totalHoursInPeriod(from, to),
            holidayHours = data.holiDay
                .filter { it.type == HolidayType.HOLIDAY }
                .totalHoursInPeriod(from, to)
        )
    }
    fun holidayReport(year: Int): List<AggregationHoliday> {
        val from = YearMonth.of(year, 1).atDay(1)
        val to = YearMonth.of(year, 12).atEndOfMonth()
        val period = FromToPeriod(from, to)
        val all = dataService.findAllData(from, to)
        return all.allPersons()
            .map { person ->
                AggregationHoliday(
                    name = person.getFullName(),
                    contractHours = all.contract
                        .filterIsInstance(ContractInternal::class.java)
                        .filter { it.person == person }
                        .map { it.totalHolidayHoursInPeriod(period) }
                        .sum(),
                    plusHours = all.holiDay
                        .filter { it.type == HolidayType.PLUSDAY }
                        .filter { it.person == person }
                        .totalHoursInPeriod(from, to),
                    holidayHours = all.holiDay
                        .filter { it.type == HolidayType.HOLIDAY }
                        .filter { it.person == person }
                        .totalHoursInPeriod(from, to)
                )
            }
    }

    fun totalPerClient(from: LocalDate, to: LocalDate): List<AggregationClient> {
        val allAssignments = assignmentService.findAllActive(from, to)
        return clientService.findAll()
            .map { client ->
                AggregationClient(
                    name = client.name,
                    revenueGross = allAssignments
                        .filter { it.client == client }
                        .toMapWorkingDay(from, to).values
                        .flatten()
                        .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() }
                )
            }
    }

    fun totalPerPerson(from: LocalDate, to: LocalDate, person: Person): AggregationPerson {
        val allData = dataService.findAllData(from, to, person.uuid)
        val totalWorkDays = countWorkDaysInPeriod(from, to)
        val period = FromToPeriod(from, to)
        return AggregationPerson(
            id = person.uuid,
            name = person.getFullName(),
            contractTypes = allData.contract
                .mapNotNull { it::class.simpleName }
                .toSet(),
            sickDays = allData.sickDay
                .toList()
                .totalHoursInPeriod(from, to),
            workDays = allData.workDay
                .toList()
                .totalHoursInPeriod(from, to),
            assignment = allData.assignment
                .toList()
                .toMapWorkingDay(from, to).values
                .flatten()
                .fold(0) { acc, cur -> acc + cur.hoursPerWeek }
                .div(5),
            event = allData.eventDay
                .map { it.totalHoursInPeriod(period) }
                .sum()
                .toInt(),
            total = allData.contract
                .sumHoursWithinAPeriod(from, to),
            holiDayUsed = allData.holiDay
                .filter { it.type == HolidayType.HOLIDAY }
                .totalHoursInPeriod(from, to),
            holiDayBalance = allData.contract
                .filterIsInstance(ContractInternal::class.java)
                .mapWorkingDay(from, to)
                .map { BigDecimal(it.hoursPerWeek * 24 * 8) }
                .sum()
                .divide(BigDecimal(totalWorkDays * 40), 10, RoundingMode.HALF_UP),
        )
    }

    fun totalPerPerson(yearMonth: YearMonth) = totalPerPerson(yearMonth.atDay(1), yearMonth.atEndOfMonth())
    fun totalPerPerson(from: LocalDate, to: LocalDate): List<AggregationPerson> {
        val all = dataService.findAllData(from, to)
        val totalWorkDays = countWorkDaysInPeriod(from, to)
        val period = FromToPeriod(from, to)
        return all.allPersons()
            .sortedBy { it.lastname }
            .map { person ->
                AggregationPerson(
                    id = person.uuid,
                    name = person.getFullName(),
                    contractTypes = all.contract
                        .filter { it.person == person }
                        .mapNotNull { it::class.simpleName }
                        .toSet(),
                    sickDays = all.sickDay.filter { it.person == person }.totalHoursInPeriod(from, to),
                    workDays = all.workDay.filter { it.assignment.person == person }.totalHoursInPeriod(from, to),
                    assignment = all.assignment
                        .filter { it.person == person }
                        .toMapWorkingDay(from, to).values
                        .flatten()
                        .fold(0) { acc, cur -> acc + cur.hoursPerWeek }
                        .div(5),
                    event = all.eventDay
                        .filter { it.persons.isEmpty() || it.persons.contains(person) }
                        .map { it.totalHoursInPeriod(period) }
                        .sum()
                        .toInt(),
                    total = all.contract
                        .filter { it.person == person }
                        .sumHoursWithinAPeriod(from, to),
                    holiDayUsed = all.holiDay
                        .filter { it.type == HolidayType.HOLIDAY }
                        .filter { it.person == person }
                        .totalHoursInPeriod(from, to),
                    holiDayBalance = all.contract
                        .filter { it.person == person }
                        .filterIsInstance(ContractInternal::class.java)
                        .mapWorkingDay(from, to)
                        .map { BigDecimal(it.hoursPerWeek * 24 * 8) }
                        .sum()
                        .divide(BigDecimal(totalWorkDays * 40), 10, RoundingMode.HALF_UP),
                    revenue = personClientRevenueOverview(all.workDay, from, to)
                        .filter { it.key.id == person.id.toString() }
                        .values
                        .firstOrNull(),
                    cost = all.contract
                        .filter { it.person == person }
                        .map { it.totalCostsInPeriod(from, to) }
                        .sum()
                )
            }
    }

    fun totalPerMonth(yearMonth: YearMonth): List<AggregationMonth> =
        totalPerMonth(yearMonth.atDay(1), yearMonth.atEndOfMonth())

    fun totalPerMonth(from: LocalDate, to: LocalDate): List<AggregationMonth> {

        val all = dataService.findAllData(from, to)
        val months = (0..ChronoUnit.MONTHS.between(from, to))
            .map { from.plusMonths(it) }
            .map { YearMonth.from(it) }

        fun contractTypes(person: Person, yearMonth: YearMonth) = all.contract
            .filter { (it is ContractInternal && it.billable) || (it is ContractExternal && it.billable) || it is ContractManagement }
            .filter { it.person == person }
            .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
            .map { it::class.java }
            .toSet()

        return months
            .map { yearMonth ->
                AggregationMonth(
                    yearMonth = yearMonth.toString(),
                    countContractInternal = all.contract
                        .filterIsInstance(ContractInternal::class.java)
                        .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
                        .filter { it.billable }
                        .distinctBy { it.person.id }
                        .count(),
                    countContractExternal = all.contract
                        .filterIsInstance(ContractExternal::class.java)
                        .filter { it.billable }
                        .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
                        .distinctBy { it.person.id }
                        .count(),
                    countContractManagement = all.contract
                        .filterIsInstance(ContractManagement::class.java)
                        .filter { it.toDateRangeInPeriod(yearMonth).isNotEmpty() }
                        .distinctBy { it.person.id }
                        .count(),
                    forecastRevenueGross = all.assignment
                        .mapWorkingDay(yearMonth)
                        .sumAmount(yearMonth),
                    forecastRevenueNet = all.assignment
                        .mapWorkingDay(yearMonth)
                        .sumAmount(yearMonth)
                        .multiply(netRevenueFactor(from, to)),
                    forecastHoursGross = all.assignment
                        .mapWorkingDay(yearMonth)
                        .sumAssignmentHoursPerWeek()
                        .divide(yearMonth.countWorkDaysInMonth().times(5).toBigDecimal(), 10, RoundingMode.HALF_UP),
                    actualRevenue = all.workDay
                        .map { it.totalRevenueInPeriod(yearMonth) }
                        .sum(),
                    actualRevenueInternal = all.workDay
                        .filter {
                            contractTypes(
                                it.assignment.person,
                                yearMonth
                            ).contains(ContractInternal::class.java)
                        }
                        .map { it.totalRevenueInPeriod(yearMonth) }
                        .sum(),
                    actualRevenueExternal = all.workDay
                        .filter {
                            contractTypes(
                                it.assignment.person,
                                yearMonth
                            ).contains(ContractExternal::class.java)
                        }
                        .map { it.totalRevenueInPeriod(yearMonth) }
                        .sum(),
                    actualRevenueManagement = all.workDay
                        .filter {
                            contractTypes(
                                it.assignment.person,
                                yearMonth
                            ).contains(ContractManagement::class.java)
                        }
                        .map { it.totalRevenueInPeriod(yearMonth) }
                        .sum(),
                    actualHours = all.workDay
                        .map { it.totalHoursInPeriod(yearMonth) }
                        .sum()
                        .divide(yearMonth.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP),
                    actualCostContractInternal = all.contract
                        .filterIsInstance(ContractInternal::class.java)
                        .map { it.totalCostInPeriod(yearMonth) }
                        .sum(),
                    actualCostContractExternal = yearMonth.toDateRange()
                        .flatMap { date ->
                            cartesianProducts(all.contract.filterIsInstance(ContractExternal::class.java), all.workDay)
                                .filter { (contract) -> contract.billable }
                                .filter { (contract, workDay) -> contract.person == workDay.assignment.person }
                                .filter { (contract, workDay) -> contract.inRange(date) && workDay.inRange(date) }
                                .map { (contract, workDay) ->
                                    contract.hourlyRate.toBigDecimal() * workDay.hoursPerDay().getValue(date)
                                }
                        }
                        .sum(),
                    actualCostContractManagement = all.contract
                        .filterIsInstance(ContractManagement::class.java)
                        .map { it.totalCostInPeriod(yearMonth) }
                        .sum(),
                    actualCostContractService = all.contract
                        .filterIsInstance(ContractServiceModel::class.java)
                        .map { it.totalCostInPeriod(yearMonth) }
                        .sum()
                )
            }
    }

    fun clientPersonHourOverview(from: LocalDate, to: LocalDate): List<AggregationClientPersonOverview> {
        return workDayService.findAllActive(from, to).groupBy {
            it.assignment.client
        }.mapValues { (client, workDays) ->
            val clientPersonItems = workDays.map { workDay ->
                val person = AggregationIdentifier(
                    id = workDay.assignment.person.id.toString(),
                    name = workDay.assignment.person.getFullName()
                )
                val workingHoursPerDay = workDay
                    .hoursPerDayInPeriod(from, to)
                    .map { it.value.toFloat() }

                AggregationClientPersonItem(
                    person = person,
                    hours = workingHoursPerDay,
                    total = workingHoursPerDay.sum()
                )
            }
            clientPersonItems.groupBy { it.person }
                .mapValues { (person, values) ->
                    val hours = values
                        .map {
                            it.hours
                        }.sumAtIndex()
                    val total = hours.sum()
                    AggregationClientPersonItem(
                        person = person,
                        hours = hours,
                        total = total
                    )
                }.map {
                    it.value
                }
        }.map { (client, clientPersonItems) ->
            AggregationClientPersonOverview(
                client = AggregationIdentifier(id = client.id.toString(), name = client.name),
                aggregationPerson = clientPersonItems,
                totals = clientPersonItems
                    .map { it.hours }
                    .sumAtIndex()
            )
        }
    }

    fun clientPersonAssignmentHourOverview(from: LocalDate, to: LocalDate): List<AggregationClientPersonAssignmentOverview> {
        return workDayService.findAllActive(from, to).groupBy {
            it.assignment.client
        }.mapValues { (client, workDays) ->
            val clientPersonItems = workDays.map { workDay ->
                val person = AggregationIdentifier(
                    id = workDay.assignment.person.uuid.toString(),
                    name = workDay.assignment.person.getFullName()
                )
                val workingHoursPerDay = workDay
                    .hoursPerDayInPeriod(from, to)
                    .map { it.value.toFloat() }

                val assignment = AggregationIdentifier(
                    id = workDay.assignment.id.toString(),
                    name = workDay.assignment.role ?: "Unknown"
                )

                AggregationClientPersonAssignmentItem(
                    person = person,
                    assignment = assignment,
                    hours = workingHoursPerDay,
                    total = workingHoursPerDay.sum()
                )
            }
            clientPersonItems.groupBy { it.personAssignmentKey() }
                .mapValues { (key, values) ->
                    val person = key.person
                    val assignment = key.assignment
                    val hours = values
                        .map {
                            it.hours
                        }.sumAtIndex()
                    val total = hours.sum()
                    AggregationClientPersonAssignmentItem(
                        person = person,
                        assignment = assignment,
                        hours = hours,
                        total = total
                    )
                }.values.sortedBy { it.person.name }
        }.map { (client, clientPersonAssignmentItems) ->
            AggregationClientPersonAssignmentOverview(
                client = AggregationIdentifier(id = client.id.toString(), name = client.name),
                aggregationPersonAssignment = clientPersonAssignmentItems,
                totals = clientPersonAssignmentItems
                    .map { it.hours }
                    .sumAtIndex()
            )
        }.sortedBy { it.client.name }
    }

    fun personClientRevenueOverview(workDays: Iterable<WorkDay>, from: LocalDate, to: LocalDate): MutableMap<AggregationIdentifier, AggregationPersonClientRevenueOverview> {
        val allWorkdays = workDays.groupBy {
            it.assignment.person
        }
        val revenueOverviewPerPerson = mutableMapOf<AggregationIdentifier, AggregationPersonClientRevenueOverview>()
        allWorkdays.forEach { (person, values) ->
            val person = AggregationIdentifier(
                id = person.id.toString(),
                name = person.getFullName()
            )
            val companyOverviews = mutableListOf<AggregationPersonClientRevenueItem>()
            values.groupBy {
                it.assignment.client
            }.map { (client, workdays) ->
                var revenueTotal = BigDecimal(BigInteger.ZERO)
                workdays.map { workDay ->
                    val revenuePerWorkDay = workDay.hoursPerDayInPeriod(from, to)
                        .calculateRevenue(workDay.assignment.hourlyRate)
                    revenueTotal = revenueTotal.plus(revenuePerWorkDay)
                }
                companyOverviews.add(
                    AggregationPersonClientRevenueItem(
                        client = AggregationIdentifier(
                            id = client.id.toString(),
                            name = client.name
                        ),
                        revenue = revenueTotal
                    )
                )
            }
            val aggregationClientOverview = AggregationPersonClientRevenueOverview(
                clients = companyOverviews,
                total = companyOverviews
                    .map { it.revenue }
                    .sum()
            )
            revenueOverviewPerPerson[person] = aggregationClientOverview
        }
        return revenueOverviewPerPerson
    }

    fun personNonProductiveHoursPerDay(person: Person, from: LocalDate, to: LocalDate): List<NonProductiveHours> {
        val holidays = holiDayService.findAllActiveByPerson(from, to, person.uuid)
            .map { it.hoursPerDayInPeriod(from, to) }
            .fold(emptyMap<LocalDate, BigDecimal>()) { acc, item -> acc.merge(item) }
        val sickdays = sickDayService.findAllActiveByPerson(from, to, person.uuid)
            .map { it.hoursPerDayInPeriod(from, to) }
            .fold(emptyMap<LocalDate, BigDecimal>()) { acc, item -> acc.merge(item) }

        val map = from.datesUntil(to.plusDays(1)).toList().associateWith { date ->
            NonProductiveHours(
                sickHours = sickdays[date]?.toDouble() ?: 0.0,
                holidayHours = holidays[date]?.toDouble() ?: 0.0
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
    data class NonProductiveHours(val sickHours: Double, val holidayHours: Double)

    fun Iterable<Iterable<Float>>.sumAtIndex() = this
        .reduce { acc, cur ->
            acc.zip(cur) { a, b -> a + b }
        }
        .toList()

    private fun List<AggregationClientPersonItem>.sumWorkDayHoursWithSameIndexes() = this
        .map { it.hours }
        .reduce { acc, list ->
            acc.zip(list) { a, b -> a + b }
        }

    private fun List<Day>.totalHoursInPeriod(from: LocalDate, to: LocalDate) = this
        .map { day ->
            day.hoursPerDayInPeriod(from, to)
                .map { it.value }
                .sum()
        }
        .sum()

    private fun Data.allPersons(): Set<Person> {
        return (
            this.assignment.map { it.person } +
                this.contract.map { it.person } +
                this.sickDay.map { it.person } +
                this.holiDay.map { it.person } +
                this.workDay.map { it.assignment.person }
            )
            .filterNotNull()
            .toSet()
    }

    fun netRevenueFactor(from: LocalDate, to: LocalDate): BigDecimal {
        val totalOffDays = listOf(
            applicationConstants.averageHoliDays,
            applicationConstants.averageSickDays,
            applicationConstants.averagePublicDays,
            applicationConstants.averageTrainingDays
        )
            .map { it.toInt() }
            .sum()
            .toBigDecimal()
        val totalWorkDays = countWorkDaysInPeriod(from, to).toBigDecimal()
        return BigDecimal.ONE - totalOffDays.divide(totalWorkDays, 10, RoundingMode.HALF_UP)
    }
}

data class FromToPeriod(
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now()
) : Period

private fun <T : Period> List<T>.toMapWorkingDay(from: LocalDate, to: LocalDate) = dateRange(from, to)
    .filterWorkingDay()
    .map { date -> date to this.filter { it.inRange(date) } }
    .toMap()

private fun Assignment.revenuePerDay(): BigDecimal = (this.hourlyRate * this.hoursPerWeek)
    .toBigDecimal()
    .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)

private fun Iterable<LocalDate>.filterWorkingDay() = this.filter { it.isWorkingDay() }

fun countWorkDaysInPeriod(from: LocalDate, to: LocalDate): Int {
    val diff = ChronoUnit.DAYS.between(from, to)
    return (0..diff)
        .map { from.plusDays(it) }
        .filterWorkingDay()
        .count()
}

private fun <T : Period> Iterable<T>.mapWorkingDay(from: LocalDate, to: LocalDate?) = dateRange(from, to)
    .filterWorkingDay()
    .flatMap { date -> this.filterInRange(date) }

private fun <T : Period> Iterable<T>.mapWorkingDay(yearMonth: YearMonth) = yearMonth
    .toDateRange()
    .filterWorkingDay()
    .flatMap { date -> this.filterInRange(date) }

private fun <T : Period> Iterable<T>.sumAmount(yearMonth: YearMonth) = this
    .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.amountPerWorkingDay(yearMonth) }

private fun Iterable<Assignment>.sumAssignmentHoursPerWeek() = this
    .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.hoursPerWeek.toBigDecimal() }

private fun Iterable<WorkDay>.sumAmount() = this
    .fold(BigDecimal.ZERO) { acc, cur -> acc + (cur.hours * cur.assignment.hourlyRate).toBigDecimal() }

fun Map.Entry<YearMonth, Iterable<Data>>.actualTotalHours(transform: Data.() -> Iterable<Dayly>): BigDecimal = value
    .flatMap(transform)
    .map { it.totalHoursInPeriod(key) }
    .sum()

private fun <A, B> cartesianProducts(a_s: Iterable<A>, b_s: Iterable<B>) = a_s.flatMap { a -> b_s.map { b -> a to b } }

data class PersonAssignmentCompositeIdentifier(val person: AggregationIdentifier, val assignment: AggregationIdentifier)
private fun AggregationClientPersonAssignmentItem.personAssignmentKey() = PersonAssignmentCompositeIdentifier(person, assignment)
