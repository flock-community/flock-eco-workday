package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.interfaces.Period
import community.flock.eco.workday.interfaces.filterInRange
import community.flock.eco.workday.interfaces.inRange
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractManagement
import community.flock.eco.workday.model.Day
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.WorkDay
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import kotlin.math.pow
import community.flock.eco.workday.model.ContractService as ContractServiceModel

@Service

class AggregationService(
    private val assignmentService: AssignmentService,
    private val contractService: ContractService,
    private val holiDayService: HoliDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val eventService: EventService,
    private val applicationConstants: ApplicationConstants
) {

    fun revenuePerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, BigDecimal> {
        return assignmentService.findAllActive(from, to)
            .toMapWorkingDay(from, to)
            .entries
            .groupingBy { YearMonth.of(it.key.year, it.key.month) }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.value.fold(BigDecimal.ZERO) { a, c -> a + c.revenuePerDay() } }
    }

    fun costPerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, BigDecimal> {
        return contractService.findAllActive(from, to)
            .toMapWorkingDay(from, to)
            .entries
            .groupingBy { YearMonth.of(it.key.year, it.key.month) }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + (cur.value.sumAmount(YearMonth.of(cur.key.year, cur.key.month))) }
    }

    fun holidayPerPerson(from: LocalDate, to: LocalDate): Map<String, Double> {
        val active = holiDayService.findAllActive(from, to)
        return active
            .groupingBy { it.person.code }
            .fold(0.0) { acc, cur -> acc + cur.hours.toDouble() }
    }

    fun sickDayPerPerson(from: LocalDate, to: LocalDate): Map<String, Double> {
        val active = sickDayService.findAllActive(from, to)
        return active
            .groupingBy { it.person.code }
            .fold(0.0) { acc, cur -> acc + cur.hours.toDouble() }
    }

    fun workDayPerPerson(from: LocalDate, to: LocalDate): Map<String, Double> {
        val active = workDayService.findAllActive(from, to)
        return active
            .groupingBy { it.assignment.person.code }
            .fold(0.0) { acc, cur -> acc + cur.hours.toDouble() }
    }

    fun revenuePerPerson(from: LocalDate, to: LocalDate): Map<String, BigDecimal> {
        return assignmentService.findAllActive(from, to)
            .toMapWorkingDay(from, to).values
            .flatten()
            .groupingBy { it.person.code }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() }
    }

    fun costPerPerson(from: LocalDate, to: LocalDate): Map<String, BigDecimal> {
        return assignmentService.findAllActive(from, to)
            .toMapWorkingDay(from, to).values
            .flatten()
            .groupingBy { it.person.code }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() }
    }

    fun revenuePerClient(from: LocalDate, to: LocalDate): Map<String, BigDecimal> {
        return assignmentService.findAllActive(from, to)
            .toMapWorkingDay(from, to).values
            .flatten()
            .groupingBy { it.client.code }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() }
    }

    fun totalPerPerson(from: LocalDate, to: LocalDate): List<Map<String, Any>> {
        val all = fetchAll(from, to)
        return all.allPersons()
            .sortedBy { it.lastname }
            .map { person ->
                mapOf(
                    "name" to "${person.firstname} ${person.lastname}",
                    "type" to all.contract
                        .filter { it.person == person }
                        .map { it::class.simpleName }
                        .toSet()
                        .joinToString(","),
                    "sickDays" to all.sickDay.filter { it.person == person }.totalHours(),
                    "holiDays" to all.holiDay.filter { it.person == person }.totalHours(),
                    "workDays" to all.workDay.filter { it.assignment.person == person }.totalHours(),
                    "assignment" to all.assignment
                        .filter { it.person == person }
                        .toMapWorkingDay(from, to).values
                        .flatten()
                        .fold(0) { acc, cur -> acc + cur.hoursPerWeek }
                        .div(5),
                    "event" to all.event
                        .filter { it.persons.isEmpty() || it.persons.contains(person) }
                        .fold(0) { acc, cur -> acc + cur.hours },
                    "total" to countWorkDaysInPeriod(from, to) * 8,
                    "revenue" to all.workDay
                        .filter { it.assignment.person == person }
                        .sumAmount()
                )
            }
    }

    fun totalPerMonth(from: LocalDate, to: LocalDate): List<Map<String, Any>> {

        val all = fetchAll(from, to)
        val months = (0..ChronoUnit.MONTHS.between(from, to))
            .map { from.plusMonths(it) }
            .map { YearMonth.from(it) }
        return months
            .map { yearMonth ->
                mapOf(
                    "yearMonth" to yearMonth.toString(),
                    "countContractInternal" to all.contract
                        .filterIsInstance(ContractInternal::class.java)
                        .map { it.toDateRangeInPeriod(yearMonth) }
                        .filter { it.isNotEmpty() }
                        .count(),
                    "forecastRevenueGross" to all.assignment
                        .perMonth(yearMonth)
                        .sumAmount(yearMonth),
                    "forecastRevenueNet" to all.assignment
                        .perMonth(yearMonth)
                        .sumAmount(yearMonth)
                        .multiply(netRevenueFactor(from, to)),
                    "actualRevenue" to all.workDay
                        .map { it.totalRevenueInPeriod(yearMonth) }
                        .sum(),
                    "actualCostContractInternal" to all.contract
                        .filterIsInstance(ContractInternal::class.java)
                        .map { it.totalCostInPeriod(yearMonth) }
                        .sum(),
                    "actualCostContractExternal" to yearMonth.toDateRange()
                        .flatMap { date -> cartesianProducts(all.contract.filterIsInstance(ContractExternal::class.java), all.workDay)
                            .filter { (contract, workDay)  -> contract.person == workDay.assignment.person}
                            .filter {(contract, workDay) -> contract.inRange(date) && workDay.inRange(date) }
                            .map {(contract, workDay) -> contract.hourlyRate.toBigDecimal() * workDay.hoursPerDay().getValue(date)}
                        }
                        .sum(),
                    "actualCostContractManagement" to all.contract
                        .filterIsInstance(ContractManagement::class.java)
                        .map { it.totalCostInPeriod(yearMonth) }
                        .sum(),
                    "actualCostContractService" to all.contract
                        .filterIsInstance(ContractServiceModel::class.java)
                        .map { it.totalCostInPeriod(yearMonth) }
                        .sum()
                )
            }
    }

    data class All(
        val sickDay: List<SickDay>,
        val holiDay: List<HoliDay>,
        val workDay: List<WorkDay>,
        val assignment: List<Assignment>,
        val contract: List<Contract>,
        val event: List<Event>
    )

    private fun List<Day>.totalHours() = this
        .fold(0.0) { acc, cur -> acc + cur.hours }

    private fun List<Assignment>.totalHours(from: LocalDate, to: LocalDate) = this
        .fold(0.0) { acc, cur -> acc + cur.hoursPerWeek / 5 }
        .pow(countWorkDaysInPeriod(from, to))


    private fun All.allPersons(): Set<Person> {
        return (this.assignment.map { it.person } +
            this.contract.map { it.person } +
            this.sickDay.map { it.person } +
            this.holiDay.map { it.person } +
            this.workDay.map { it.assignment.person })
            .filterNotNull()
            .toSet()
    }

    private fun fetchAll(from: LocalDate, to: LocalDate): All {
        val activeWorkDay = workDayService.findAllActive(from, to)
        val activeHoliDay = holiDayService.findAllActive(from, to)
        val activeSickDay = sickDayService.findAllActive(from, to)
        val activeAssignment = assignmentService.findAllActive(from, to)
        val activeContract = contractService.findAllActive(from, to)
        val activeEvent = eventService.findAllActive(from, to)
        return All(
            activeSickDay,
            activeHoliDay,
            activeWorkDay,
            activeAssignment,
            activeContract,
            activeEvent
        )
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

data class FromToPeriod(
    override val from: LocalDate = LocalDate.now(),
    override val to: LocalDate = LocalDate.now()
) : Period

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

private fun Period.countDays() = ChronoUnit.DAYS.between(this.from, this.to)
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


private fun <T : Period> List<T>.perMonth(yearMonth: YearMonth) = yearMonth
    .toDateRange()
    .filterWorkingDay()
    .flatMap { date -> this.filterInRange(date) }

private fun <T : Period> Iterable<T>.sumAmount(yearMonth: YearMonth) = this
    .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.amountPerWorkingDay(yearMonth) }

private fun Iterable<WorkDay>.sumAmount() = this
    .fold(BigDecimal.ZERO) { acc, cur -> acc + (cur.hours * cur.assignment.hourlyRate).toBigDecimal() }

fun Day.hoursPerDay(): Map<LocalDate, BigDecimal> = this
    .toDateRange()
    .mapIndexed { index, localDate ->
        localDate to if (this.days?.isNotEmpty()!!) {
            this.days?.get(index)
                ?.toBigDecimal()
                ?: BigDecimal.ZERO
        } else {
            this.hours
                .toBigDecimal()
                .divide(this.countDays().toBigDecimal(), 10, RoundingMode.HALF_UP)
        }
    }
    .toMap()

private fun Iterable<BigDecimal>.sum() = this
    .fold(BigDecimal.ZERO) { acc, cur -> acc + cur }

fun Day.totalHoursInPeriod(period: Period): BigDecimal {
    val hours = this.hoursPerDay()
    return period
        .toDateRange()
        .mapNotNull { hours[it] }
        .sum()
}

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

private fun <A, B> cartesianProducts(a_s:List<A>, b_s:List<B>) = a_s.flatMap { a -> b_s.map { b -> a to b } }
