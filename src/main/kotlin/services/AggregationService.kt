package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractManagement
import community.flock.eco.workday.model.Day
import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.WorkDay
import community.flock.eco.workday.interfaces.inRange
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import community.flock.eco.workday.model.ContractService as ContractServiceModel

@Service

class AggregationService(
    private val assignmentService: AssignmentService,
    private val contractService: ContractService,
    private val holiDayService: HoliDayService,
    private val sickDayService: SickDayService,
    private val workDayService: WorkDayService,
    private val applicationConstants: ApplicationConstants
) {

    fun revenuePerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, BigDecimal> {
        val active = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to active.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.second.fold(BigDecimal.ZERO) { a, c -> a + c.revenuePerDay() } }
    }

    fun costPerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, BigDecimal> {
        val active = contractService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to active.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + (cur.second.sumCosts(cur.first)) }
    }


    fun holidayPerPerson(from: LocalDate, to: LocalDate): Map<String, Double> {
        val active = holiDayService.findAllActive(from, to)
        return active
            .groupingBy { it.person.code }
            .fold(0.0) { acc, cur -> acc + cur.hours.toDouble() }
    }

    fun sickdayPerPerson(from: LocalDate, to: LocalDate): Map<String, Double> {
        val active = sickDayService.findAllActive(from, to)
        return active
            .groupingBy { it.person.code }
            .fold(0.0) { acc, cur -> acc + cur.hours.toDouble() }
    }

    fun workdayPerPerson(from: LocalDate, to: LocalDate): Map<String, Double> {
        val active = workDayService.findAllActive(from, to)
        return active
            .groupingBy { it.assignment.person.code }
            .fold(0.0) { acc, cur -> acc + cur.hours.toDouble() }
    }

    fun revenuePerPerson(from: LocalDate, to: LocalDate): Map<String, BigDecimal> {
        val active = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .flatMap { date -> active.filter { it.inRange(date) }.asSequence() }
            .groupingBy { it.person.code }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() }
    }

    fun costPerPerson(from: LocalDate, to: LocalDate): Map<String, BigDecimal> {
        val active = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .flatMap { date -> active.filter { it.inRange(date) }.asSequence() }
            .groupingBy { it.person.code }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() }
    }

    fun revenuePerClient(from: LocalDate, to: LocalDate): Map<String, BigDecimal> {
        val active = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .flatMap { date -> active.filter { it.inRange(date) }.asSequence() }
            .groupingBy { it.client.code }
            .fold(BigDecimal.ZERO) { acc, cur -> acc + cur.revenuePerDay() }
    }

    fun daysPerPerson(from: LocalDate, to: LocalDate): List<Map<String, String>> {
        val all = fetchAll(from, to)
        val persons = all.allPersons()
        return persons
            .map { person ->
                mapOf(
                    "name" to "${person.firstname} ${person.lastname}",
                    "sickDays" to all.sickDay.filter{it.person == person}.totalHours(),
                    "holiDays" to all.holiDay.filter{it.person == person}.totalHours(),
                    "workDays" to all.workDay.filter{it.assignment.person == person}.totalHours()

                )
            }
    }

    data class All(
        val sickDay: List<SickDay>,
        val holiDay: List<HoliDay>,
        val workDay: List<WorkDay>,
        val assignment: List<Assignment>,
        val contract: List<Contract>
    )

    private fun List<Day>.totalHours() = this
        .fold(0.0) { acc, cur -> acc + cur.hours }
        .toString()

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
        return All(
            activeSickDay,
            activeHoliDay,
            activeWorkDay,
            activeAssignment,
            activeContract
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

fun dateRange(from: LocalDate, to: LocalDate) = (0..ChronoUnit.DAYS.between(from, to))
    .asSequence()
    .map { from.plusDays(it) }


fun Assignment.revenuePerDay(): BigDecimal {
    return (this.hourlyRate * this.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
}

fun LocalDate.isWorkingDay() = listOf(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).contains(this.dayOfWeek)
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

fun Contract.costPerDay(date: LocalDate) = when (this) {
    is ContractInternal -> this.monthlySalary.toBigDecimal().divide(date.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    is ContractExternal -> (this.hourlyRate * this.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
    is ContractManagement -> this.monthlyFee.toBigDecimal().divide(date.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    is ContractServiceModel -> this.monthlyCosts.toBigDecimal().divide(date.countWorkDaysInMonth().toBigDecimal(), 10, RoundingMode.HALF_UP)
    else -> BigDecimal(0)
}

fun List<Contract>.sumCosts(date: LocalDate) = this
    .fold(BigDecimal(0), { acc, cur -> acc + cur.costPerDay(date) })
