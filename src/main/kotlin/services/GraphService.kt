package community.flock.eco.workday.services

import community.flock.eco.workday.model.Assignment
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.time.temporal.ChronoUnit
import org.springframework.stereotype.Service

@Service
class GraphService(
    private val assignmentService: AssignmentService
) {

    fun revenuePerMonth(from: LocalDate, to: LocalDate): Map<YearMonth, Double> {
        val activeAssignments = assignmentService.findAllActive(from, to)
        val diff = ChronoUnit.DAYS.between(from, to)
        return (0..diff)
            .map { from.plusDays(it) }
            .filter { it.isWorkingDay() }
            .map { date -> date to activeAssignments.filter { it.inRange(date) } }
            .groupingBy { YearMonth.of(it.first.year, it.first.month) }
            .fold(0.0) { acc, cur -> acc + cur.second.sumByDouble { it.revenuePerDay() } }
    }

    fun Assignment.inRange(date: LocalDate) = this
        .let { it.startDate <= date && it.endDate?.let { endDate -> endDate > date } ?: true }

    fun Assignment.revenuePerDay() = this.hoursPerWeek / 5 * this.hourlyRate

    fun LocalDate.isWorkingDay() = listOf(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).contains(this.dayOfWeek)
}
