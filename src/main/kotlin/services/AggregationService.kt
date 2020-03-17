package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.interfaces.Period
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
            .fold(BigDecimal.ZERO) { acc, cur -> acc + (cur.value.sumCosts(cur.key)) }
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
        val persons = all.allPersons()
        return persons
            .sortedBy { it.lastname }
            .map { person ->
                mapOf(
                    "name" to "${person.firstname} ${person.lastname}",
                    "type" to all.contract.filter { it.person == person }.map { it::class.simpleName }.joinToString(","),
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
                        .filter { it.persons.isEmpty()  ||  it.persons.contains(person) }
                        .fold(0) { acc, cur -> acc + cur.hours },
                    "total" to countWorkDaysInPeriod(from,to) * 8,
                    "revenue" to all.workDay
                        .filter { it.assignment.person == person }
                        .fold(BigDecimal.ZERO) { acc, cur -> acc + (cur.hours * cur.assignment.hourlyRate).toBigDecimal() }
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
            .requireNoNulls()
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
        val totalDays = dateRange(from, to)
            .filter { it.isWorkingDay() }
            .count()
            .toBigDecimal()
            .setScale(1)

        val offDays = listOf(
            applicationConstants.averageSickday.toInt(),
            applicationConstants.holidays.toInt(),
            applicationConstants.extradays.toInt())
            .sum()
            .toBigDecimal()
            .setScale(1)

        return (totalDays - offDays) / totalDays
    }
}

private fun dateRange(from: LocalDate, to: LocalDate) = (0..ChronoUnit.DAYS.between(from, to))
    .asSequence()
    .map { from.plusDays(it) }


private fun <T : Period> List<T>.toMapWorkingDay(from: LocalDate, to: LocalDate) = dateRange(from, to)
    .filter { it.isWorkingDay() }
    .map { date -> date to this.filter { it.inRange(date) } }
    .toMap()

private fun Assignment.revenuePerDay(): BigDecimal {
    return (this.hourlyRate * this.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
}

private fun LocalDate.isWorkingDay() = listOf(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).contains(this.dayOfWeek)

fun LocalDate.countWorkDaysInMonth(): Int {
    val from = YearMonth.of(this.year, this.month).atDay(1)
    val to = YearMonth.of(this.year, this.month).atEndOfMonth()
    return countWorkDaysInPeriod(from, to)
}

fun countWorkDaysInPeriod(from: LocalDate, to: LocalDate): Int {
    val diff = ChronoUnit.DAYS.between(from, to)
    return (0..diff)
        .asSequence()
        .map { from.plusDays(it) }
        .filter { it.isWorkingDay() }
        .count()
}

private fun Contract.costPerDay(date: LocalDate) = when (this) {
    is ContractInternal -> this.monthlySalary.toBigDecimal().divide(date.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    is ContractExternal -> (this.hourlyRate * this.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
    is ContractManagement -> this.monthlyFee.toBigDecimal().divide(date.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    is ContractServiceModel -> this.monthlyCosts.toBigDecimal().divide(date.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    else -> BigDecimal(0)
}

private fun List<Contract>.sumCosts(date: LocalDate) = this
    .fold(BigDecimal(0), { acc, cur -> acc + cur.costPerDay(date) })
