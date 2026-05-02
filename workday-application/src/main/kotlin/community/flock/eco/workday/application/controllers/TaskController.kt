package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.GetTaskReminder
import community.flock.eco.workday.application.services.AggregationService
import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.application.services.email.WorkdayEmailService
import org.springframework.web.bind.annotation.RestController
import java.math.BigDecimal
import java.time.YearMonth

@RestController
class TaskController(
    private val aggregationService: AggregationService,
    private val personService: PersonService,
    private val emailService: WorkdayEmailService,
) : GetTaskReminder.Handler {
    override suspend fun getTaskReminder(request: GetTaskReminder.Request): GetTaskReminder.Response<*> {
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
        return GetTaskReminder.Response200(Unit)
    }
}
