package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConstants
import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.ContractExternal
import community.flock.eco.workday.model.ContractInternal
import community.flock.eco.workday.model.ContractManagement
import community.flock.eco.workday.model.ContractService as ContractServiceModel
import java.math.BigDecimal
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import org.springframework.stereotype.Service

@Service

class AggregationService(
    private val assignmentService: AssignmentService,
    private val contractService: ContractService,
    private val holidayService: HolidayService,
    private val sickDayService: SickDayService,
    private val applicationConstants: ApplicationConstants
) {

    fun revenuePerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, Double> {
        val active = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to active.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(0.0) { acc, cur -> acc + cur.second.sumByDouble { it.revenuePerDay() } }
    }

    fun costPerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, BigDecimal> {
        val active = contractService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to active.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(BigDecimal(0), { acc, cur -> acc + (cur.second.sumCosts(cur.first)) })
    }

    fun revenuePerPerson(from: LocalDate, to: LocalDate): Map<YearMonth, Double> {
        val active = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to active.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(0.0) { acc, cur -> acc + cur.second.sumByDouble { it.revenuePerDay() } }
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

    fun revenuePerClient(from: LocalDate, to: LocalDate): Map<String, Double> {
        val active = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .flatMap { date -> active.filter { it.inRange(date) }.asSequence() }
            .groupingBy { it.client.code }
            .fold(0.0) { acc, cur -> acc + cur.revenuePerDay() }
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

fun Assignment.revenuePerDay() = this.hoursPerWeek / 5 * this.hourlyRate

fun Contract.inRange(date: LocalDate) = this
    .let { it.startDate <= date && it.endDate?.let { endDate -> endDate >= date } ?: true }

fun LocalDate.isWorkingDay() = listOf(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).contains(this.dayOfWeek)
fun LocalDate.countWorkDaysInmonth(): Int {
    val from = YearMonth.of(this.year, this.month).atDay(1)
    val to = YearMonth.of(this.year, this.month).atEndOfMonth()
    val diff = ChronoUnit.DAYS.between(from, to)
    return (0..diff)
        .asSequence()
        .map { from.plusDays(it) }
        .filter { it.isWorkingDay() }
        .count()
}

fun Contract.costPerDay(date: LocalDate) = when (this) {
    is ContractInternal -> this.monthlySalary.toBigDecimal().setScale(1) / date.countWorkDaysInmonth().toBigDecimal().setScale(1)
    is ContractExternal -> this.hourlyRate.toBigDecimal().setScale(1) * this.hoursPerWeek.toBigDecimal().setScale(1) / 5.toBigDecimal().setScale(1)
    is ContractManagement -> this.monthlyFee.toBigDecimal().setScale(1) / date.countWorkDaysInmonth().toBigDecimal().setScale(1)
    is ContractServiceModel -> this.monthlyCosts.toBigDecimal().setScale(1) / date.countWorkDaysInmonth().toBigDecimal().setScale(1)
    else -> BigDecimal(0)
}

fun List<Contract>.sumCosts(date: LocalDate) = this
    .fold(BigDecimal(0), { acc, cur -> acc + cur.costPerDay(date) })
