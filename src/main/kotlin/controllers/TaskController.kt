package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.AggregationService
import community.flock.eco.workday.services.PersonService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.YearMonth
import java.util.*

@RestController
@RequestMapping("/tasks")
class TaskController(
    private val aggregationService: AggregationService,
    private val personService: PersonService,
) {

    @GetMapping("/reminder")
    fun reminder(@RequestParam("apiKey") apiKey: String): List<String> {
        val yearMonth = YearMonth.now()
        val from = yearMonth.atDay(1)
        val to = yearMonth.atEndOfMonth()
        val data = aggregationService.totalPerPerson(from, to)
        return data
            .filter { it.workDays == BigDecimal.ZERO }
            .map { personService.findByUuid(it.id) }
            .mapNotNull { it?.email?.substring(0, 3) }
    }
}
