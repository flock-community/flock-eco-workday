package community.flock.eco.workday.controllers

import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.AggregationService
import community.flock.eco.workday.services.MailjetService
import community.flock.eco.workday.services.PersonService
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
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

    private val log: Logger = LoggerFactory.getLogger(TaskController::class.java)

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
    fun test(): List<Person> {
        val list = personService.findAll(PageRequest.of(0, 1000)).toList()
        list.filter { it.reminders }
            .forEach {
                log.info("Send email ${it.email}")
                mailjetService.sendReminder(it, YearMonth.now())
            }
        return list
    }


}
