package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.model.BudgetCategory
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.utils.NumericUtils.sum
import community.flock.eco.workday.domain.budget.PersonBudgetEvent
import community.flock.eco.workday.domain.budget.PersonBudgetItem
import community.flock.eco.workday.domain.budget.PersonBudgetSummary
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Service
class BudgetSummaryService(
    private val contractService: ContractService,
    private val eventDayService: EventDayService,
) {
    fun getSummary(
        personId: UUID,
        year: Int,
    ): PersonBudgetSummary {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        val period = FromToPeriod(from, to)
        val internalContracts =
            contractService.findAllActiveByPerson(from, to, personId).filterIsInstance<ContractInternal>()
        val eventDays = eventDayService.findAllActiveByPerson(from, to, personId)

        val hackHoursBudget = internalContracts.map { it.totalHackDayHoursInPeriod(period) }.sum()
        val trainingHoursBudget = internalContracts.map { it.totalTrainingDayHoursInPeriod(period) }.sum()
        val trainingMoneyBudget = internalContracts.map { it.totalTrainingMoneyInPeriod(period) }.sum()

        val hackDays = eventDays.filter { (it.budgetCategory ?: it.event.budgetCategory) == BudgetCategory.HACK }
        val trainingDays = eventDays.filter { (it.budgetCategory ?: it.event.budgetCategory) == BudgetCategory.TRAINING }
        val hackHoursUsed = hackDays.sumOf { it.hours }.toBigDecimal()
        val trainingHoursUsed = trainingDays.sumOf { it.hours }.toBigDecimal()
        val trainingMoneyUsed = trainingDays.sumOf { it.cost ?: BigDecimal.ZERO }

        val budgetBearingDays = hackDays + trainingDays
        val events =
            budgetBearingDays
                .sortedBy { it.event.from }
                .map { day ->
                    PersonBudgetEvent(
                        eventCode = day.event.code,
                        description = day.event.description,
                        from = day.event.from,
                        hours = day.hours,
                        cost = day.cost,
                        category = (day.budgetCategory ?: day.event.budgetCategory!!).toDomain(),
                    )
                }

        return PersonBudgetSummary(
            hackTimeBudget = PersonBudgetItem(hackHoursBudget, hackHoursUsed),
            trainingTimeBudget = PersonBudgetItem(trainingHoursBudget, trainingHoursUsed),
            trainingMoneyBudget = PersonBudgetItem(trainingMoneyBudget, trainingMoneyUsed),
            events = events,
        )
    }
}
