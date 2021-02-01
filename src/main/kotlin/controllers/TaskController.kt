package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.AggregationService
import community.flock.eco.workday.services.MailjetService
import community.flock.eco.workday.services.PersonService
import org.springframework.data.domain.PageRequest
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
    private val mailjetService: MailjetService
) {

    @GetMapping("/reminder")
    fun reminder(): List<String> {
        val yearMonth = YearMonth.now().minusMonths(1)
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        val data = aggregationService.totalPerPerson(from, to)
        return data
            .filter { it.workDays == BigDecimal.ZERO }
            .mapNotNull { personService.findByUuid(it.id) }
            .filter { it.reminders }
            .map { it.email }
    }

    @GetMapping("/test")
    fun test() {
        personService.findAll(PageRequest.of(1, 100))
            .find { it.email == "willem.veelenturf@gmail.com" }
            ?.run { mailjetService.sendReminder(this, YearMonth.now()) }

    }
}
