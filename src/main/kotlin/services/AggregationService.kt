package community.flock.eco.workday.services

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
    private val contractService: ContractService
) {

    fun revenuePerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, Double> {
        val activeAssignments = assignmentService.findAllActive(from, to)
        val diff = ChronoUnit.DAYS.between(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to activeAssignments.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(0.0) { acc, cur -> acc + cur.second.sumByDouble { it.revenuePerDay() } }
    }

    fun costPerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, BigDecimal> {
        val activeContracts = contractService.findAllActive(from, to)
        val diff = ChronoUnit.DAYS.between(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to activeContracts.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(BigDecimal(0), { acc, cur -> acc + cur.second.sumCosts(cur.first) })
    }

    fun revenuePerPerson(from: LocalDate, to: LocalDate): Map<YearMonth, Double> {
        val activeAssignments = assignmentService.findAllActive(from, to)
        return dateRange(from, to)
            .filter { it.isWorkingDay() }
            .map { date -> date to activeAssignments.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(0.0) { acc, cur -> acc + cur.second.sumByDouble { it.revenuePerDay() } }
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
    is ContractInternal -> this.monthlySalary.toBigDecimal() / date.countWorkDaysInmonth().toBigDecimal()
    is ContractExternal -> this.hourlyRate.toBigDecimal() * this.hoursPerWeek.toBigDecimal() / 5.toBigDecimal()
    is ContractManagement -> this.monthlyFee.toBigDecimal() / date.countWorkDaysInmonth().toBigDecimal()
    is ContractServiceModel -> this.monthlyCosts.toBigDecimal() / date.countWorkDaysInmonth().toBigDecimal()
    else -> BigDecimal(0)
}

fun List<Contract>.sumCosts(date: LocalDate) = this
    .fold(BigDecimal(0), { acc, cur -> acc + cur.costPerDay(date) })
