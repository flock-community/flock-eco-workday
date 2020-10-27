package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.interfaces.Dayly
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.interfaces.filterInRange
import community.flock.eco.workday.interfaces.inRange
import community.flock.eco.workday.model.AggregationClient
import community.flock.eco.workday.model.AggregationMonth
import community.flock.eco.workday.model.AggregationPerson
import community.flock.eco.workday.model.AggregationDayly
import community.flock.eco.workday.model.AggregationPersonReport
import community.flock.eco.workday.model.AggregationPersonReportMonth
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractManagement
import community.flock.eco.workday.model.Day
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.WorkDay
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import java.util.UUID
import javax.transaction.Transactional
import community.flock.eco.workday.model.ContractService as ContractServiceModel

@Service

class AggregationService(
    private val personService: PersonService,
    private val clientService: ClientService,
    private val assignmentService: AssignmentService,
    private val dataService: DataService,
    private val applicationConstants: ApplicationConstants
) {

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

    @Transactional
    fun totalPerPerson(from: LocalDate, to: LocalDate): List<AggregationPerson> {
        val all = dataService.findAllData(from, to)
        val totalWorkDays = countWorkDaysInPeriod(from, to)
        val period = FromToPeriod(from, to)
        return all.allPersons()
            .sortedBy { it.lastname }
            .map { person ->
                AggregationPerson(
                    name = person.fullName(),
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
                    holiDayUsed = all.holiDay.filter { it.person == person }.totalHoursInPeriod(from, to),
                    holiDayBalance = all.contract
                        .filter { it.person == person }
                        .filterIsInstance(ContractInternal::class.java)
                        .mapWorkingDay(from, to)
                        .map { BigDecimal(it.hoursPerWeek * 24 * 8) }
                        .sum()
                        .divide(BigDecimal(totalWorkDays * 40), 10, RoundingMode.HALF_UP),
                    revenue = all.workDay
                        .filter { it.assignment.person == person }
                        .sumAmount()
                )
            }
    }

    @Transactional
    fun totalPerPerson(personCode: UUID): AggregationPersonReport {
        return personService.findByCode(personCode.toString())
            ?.let { person ->
                val all = dataService.findAllData(personCode)
                val now = LocalDate.now()
                val startDate = all.contract
                    .map { it.from }
                    .reduce { acc, it -> if (acc > it) it else acc }
                val period = FromToPeriod(startDate, now)
                val history = period
                    .toDateRange()
                    .map { it to all.filterInRange(it) }
                    .groupBy({ YearMonth.of(it.first.year, it.first.month) }, { it.second })
                    .map { AggregationPersonReportMonth(
                            name = it.key.toString(),
                            actualTotalHours = AggregationDayly(
                                workDay = it.actualTotalHours{ workDay },
                                holiDay = it.actualTotalHours{ holiDay },
                                sickDay = it.actualTotalHours{ sickDay },
                                eventDay = it.actualTotalHours{ eventDay }
                            )
                        )
                    }
                AggregationPersonReport(
                    name = person.fullName(),
                    startDate = startDate,
                    month = history
                )
            }
            ?: throw error("Cannot find person with code: $personCode")
    }

    @Transactional
    fun totalPerMonth(from: LocalDate, to: LocalDate): List<AggregationMonth> {

        val all = dataService.findAllData(from, to)
        val months = (0..ChronoUnit.MONTHS.between(from, to))
            .map { from.plusMonths(it) }
            .map { YearMonth.from(it) }
        return months
            .map { yearMonth ->
                AggregationMonth(
                    yearMonth = yearMonth.toString(),
                    countContractInternal = all.contract
                        .filterIsInstance(ContractInternal::class.java)
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
                                .filter { (contract, workDay) -> contract.person == workDay.assignment.person }
                                .filter { (contract, workDay) -> contract.inRange(date) && workDay.inRange(date) }
                                .map { (contract, workDay) -> contract.hourlyRate.toBigDecimal() * workDay.hoursPerDay().getValue(date) }
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

    private fun List<Day>.totalHoursInPeriod(from: LocalDate, to: LocalDate) = this
        .map { day ->
            val hours = day.hoursPerDay()
            dateRange(from, to)
                .mapNotNull { hours[it] }
                .sum()
        }
        .sum()

    private fun Data.allPersons(): Set<Person> {
        return (this.assignment.map { it.person } +
            this.contract.map { it.person } +
            this.sickDay.map { it.person } +
            this.holiDay.map { it.person } +
            this.workDay.map { it.assignment.person })
            .filterNotNull()
            .toSet()
    }

    fun netRevenueFactor(from: LocalDate, to: LocalDate): BigDecimal {
        val totalOffDays = listOf(
            applicationConstants.averageHoliDays,
            applicationConstants.averageSickDays,
            applicationConstants.averagePublicDays,
            applicationConstants.averageTrainingDays)
            .map { it.toInt() }
            .sum()
            .toBigDecimal()
        val totalWorkDays = countWorkDaysInPeriod(from, to).toBigDecimal()
        return BigDecimal.ONE - totalOffDays.divide(totalWorkDays, 10, RoundingMode.HALF_UP)
    }
}

private fun Person.fullName(): String = "$firstname $lastname"

data class FromToPeriod(
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now()
) : Period

private fun FromToPeriod.toDateRange() = dateRange(this.from, this.to)
private fun Period.toDateRange() = dateRange(this.from, this.to)
private fun YearMonth.toDateRange() = dateRange(this.atDay(1), this.atEndOfMonth())
private fun YearMonth.toPeriod() = FromToPeriod(this.atDay(1), this.atEndOfMonth())
private fun Pair<LocalDate, LocalDate>.toDateRange() = dateRange(this.first, this.second)
private fun dateRange(from: LocalDate, to: LocalDate?) = (0..ChronoUnit.DAYS.between(from, to))
    .map { from.plusDays(it) }

private fun <T : Period> T.toDateMap() = this.toDateRange().map { it to this }.toMap()

private fun Period.toDateRangeInPeriod(from: LocalDate, to: LocalDate) = dateRange(from, to)
    .filterInPeriod(this)

private fun Period.toDateRangeInPeriod(yearMonth: YearMonth) = yearMonth
    .toDateRange()
    .filterInPeriod(this)

private fun List<LocalDate>.filterInPeriod(period: Period) = this
    .filter { period.from <= it }
    .filter { period.to?.let { to -> to >= it } ?: true }

private fun <T : Period> List<T>.toMapWorkingDay(from: LocalDate, to: LocalDate) = dateRange(from, to)
    .filterWorkingDay()
    .map { date -> date to this.filter { it.inRange(date) } }
    .toMap()

private fun Assignment.revenuePerDay(): BigDecimal = (this.hourlyRate * this.hoursPerWeek)
    .toBigDecimal()
    .divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)

private fun LocalDate.isWorkingDay() = listOf(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).contains(this.dayOfWeek)
private fun Iterable<LocalDate>.filterWorkingDay() = this.filter { it.isWorkingDay() }

private fun Period.countDays() = ChronoUnit.DAYS.between(this.from, this.to) + 1
private fun YearMonth.countWorkDaysInMonth(): Int {
    val from = this.atDay(1)
    val to = this.atEndOfMonth()
    return countWorkDaysInPeriod(from, to)
}

fun LocalDate.countWorkDaysInMonth(): Int {
    val from = YearMonth.of(this.year, this.month).atDay(1)
    val to = YearMonth.of(this.year, this.month).atEndOfMonth()
    return countWorkDaysInPeriod(from, to)
}

fun countWorkDaysInPeriod(from: LocalDate, to: LocalDate): Int {
    val diff = ChronoUnit.DAYS.between(from, to)
    return (0..diff)
        .map { from.plusDays(it) }
        .filterWorkingDay()
        .count()
}

private fun Period.amountPerWorkingDay(month: YearMonth) = when (this) {
    is ContractInternal -> this.monthlySalary.toBigDecimal().divide(month.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    is ContractExternal -> (this.hourlyRate * this.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
    is ContractManagement -> this.monthlyFee.toBigDecimal().divide(month.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    is ContractServiceModel -> this.monthlyCosts.toBigDecimal().divide(month.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    is Assignment -> (this.hourlyRate * this.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
    is WorkDay -> (this.assignment.hourlyRate * this.assignment.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
    else -> error("Cannot get amount per working day")
}

private fun Contract.totalHoursPerWeek() = when (this) {
    is ContractInternal -> this.hoursPerWeek
    is ContractExternal -> this.hoursPerWeek
    is ContractManagement -> 40
    else -> error("Unknown contract type")
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


fun Dayly.hoursPerDay(): Map<LocalDate, BigDecimal> = this
    .toDateRange()
    .mapIndexed { index, localDate ->
        localDate to if (this.days?.isNotEmpty()!!) {
            this.days?.get(index)
                ?.toBigDecimal()
                ?: BigDecimal.ZERO
        } else {
            this.hours
                .toBigDecimal()
                .divide(this.countDays().toBigDecimal(), 100, RoundingMode.HALF_UP)
        }
    }
    .toMap()

private fun Iterable<BigDecimal>.sum() = this
    .fold(BigDecimal.ZERO) { acc, cur -> acc + cur }

fun Dayly.totalHoursInPeriod(period: Period): BigDecimal {
    val hours = this.hoursPerDay()
    return period
        .toDateRange()
        .mapNotNull { hours[it] }
        .sum()
}

fun Dayly.totalHoursInPeriod(yearMonth: YearMonth): BigDecimal = this
    .totalHoursInPeriod(yearMonth.toPeriod())

fun WorkDay.totalRevenueInPeriod(period: Period): BigDecimal = this
    .totalHoursInPeriod(period)
    .multiply(this.assignment.hourlyRate.toBigDecimal())

fun WorkDay.totalRevenueInPeriod(yearMonth: YearMonth): BigDecimal = this
    .totalRevenueInPeriod(yearMonth.toPeriod())

fun ContractInternal.totalCostInPeriod(yearMonth: YearMonth): BigDecimal = this
    .toDateRangeInPeriod(yearMonth)
    .map { this.monthlySalary.toBigDecimal() }
    .sum()
    .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)

fun ContractManagement.totalCostInPeriod(yearMonth: YearMonth): BigDecimal = this
    .toDateRangeInPeriod(yearMonth)
    .map { this.monthlyFee.toBigDecimal() }
    .sum()
    .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)

fun ContractServiceModel.totalCostInPeriod(yearMonth: YearMonth): BigDecimal = this
    .toDateRangeInPeriod(yearMonth)
    .map { this.monthlyCosts.toBigDecimal() }
    .sum()
    .divide(yearMonth.lengthOfMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)

fun Map.Entry<YearMonth, Iterable<Data>>.actualTotalHours(transform: Data.() -> Iterable<Dayly>): BigDecimal = value
    .flatMap(transform)
    .map { it.totalHoursInPeriod(key) }
    .sum()


private fun <A, B> cartesianProducts(a_s: Iterable<A>, b_s: Iterable<B>) = a_s.flatMap { a -> b_s.map { b -> a to b } }
