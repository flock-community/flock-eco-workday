package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractManagement
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
    private val holidayService: HolidayService,
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
        val active = holidayService.findAllActive(from, to)
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
            .groupingBy { it.person.code }
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

fun Assignment.inRange(date: LocalDate) = this
    .let { it.startDate <= date && it.endDate?.let { endDate -> endDate >= date } ?: true }

fun Assignment.revenuePerDay(): BigDecimal {
    return (this.hourlyRate * this.hoursPerWeek).toBigDecimal().divide(BigDecimal.valueOf(5), 10, RoundingMode.HALF_UP)
}

fun Contract.inRange(date: LocalDate) = this
    .let { it.startDate <= date && it.endDate?.let { endDate -> endDate >= date } ?: true }

fun LocalDate.isWorkingDay() = listOf(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).contains(this.dayOfWeek)
fun LocalDate.countWorkDaysInMonth(): Int {
    val from = YearMonth.of(this.year, this.month).atDay(1)
    val to = YearMonth.of(this.year, this.month).atEndOfMonth()
    return countWorkDaysInPeriod(from, to)
}

fun countWorkDaysInPeriod(from:LocalDate, to: LocalDate): Int {
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
