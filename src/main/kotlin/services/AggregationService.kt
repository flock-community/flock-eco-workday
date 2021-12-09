package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.graphql.* // ktlint-disable no-wildcard-imports
import community.flock.eco.workday.interfaces.* // ktlint-disable no-wildcard-imports
import community.flock.eco.workday.model.* // ktlint-disable no-wildcard-imports
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
    private val workDayService: WorkDayService
) {

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
                        .map { it.totalHoursPerWeek() }
                        .sum()
                        .let { countWorkDaysInPeriod(from, to) * 8 * it / 40 },
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
                    totalRevenue = personClientRevenueOverview(from, to)
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
                                .filter { (contract, workDay) -> contract.billable }
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
            workDays.map { workDay ->
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
        }.map { (client, aggregationClientPersonItem) ->
            AggregationClientPersonOverview(
                client = AggregationIdentifier(
                    id = client.id.toString(),
                    name = client.name
                ),
                aggregationPerson = aggregationClientPersonItem,
                totals = aggregationClientPersonItem.sumWorkDayHoursWithSameIndexes()
            )
        }
    }

    fun personClientRevenueOverview(from: LocalDate, to: LocalDate): List<AggregationPersonClientRevenueOverview> {
        val allData = dataService.findAllData(from, to).workDay.groupBy {
            it.assignment.person
        }
        val revenueOverview = mutableListOf<AggregationPersonClientRevenueOverview>()
        allData.forEach { (person, values) ->
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
                        //TODO Change to bigdecimal
                        revenue = revenueTotal.toFloat()
                    )
                )
            }
            revenueOverview.add(
                AggregationPersonClientRevenueOverview(
                    person = person,
                    clients = companyOverviews,
                    total = companyOverviews
                        .sumByDouble { it.revenue.toDouble() }
                        .toFloat()
                )
            )
        }
        return revenueOverview
    }


    fun Iterable<Iterable<Float>>.sumIndex() = this
        .reduce { acc, cur ->
            acc.zip(cur) { a, b -> a + b }
        }


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
