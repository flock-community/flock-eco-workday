package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.AggregationService
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.services.email.WorkdayEmailService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.YearMonth

@RestController
@RequestMapping("/tasks")
class TaskController(
    private val aggregationService: AggregationService,
    private val personService: PersonService,
    private val emailService: WorkdayEmailService,
) {
    @GetMapping("/reminder")
    fun reminder() {
        val yearMonth = YearMonth.now().minusMonths(1)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        val data = aggregationService.totalPerPerson(from, to)
        data
            .filter { it.workDays == BigDecimal.ZERO }
            .mapNotNull { personService.findByUuid(it.id) }
            .filter { it.reminders }
            .forEach {
                emailService.sendReminder(it)
            }
    }
}
