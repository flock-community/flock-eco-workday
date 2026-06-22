package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.AllocationType
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.utils.NumericUtils.sum
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Service
class BudgetSummaryService(
    private val dataService: DataService,
) {
    fun getSummary(
        personId: UUID,
        year: Int,
    ): PersonBudgetSummary {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)
        val period = FromToPeriod(from, to)
        val data = dataService.findAllData(from, to, personId)
        val internalContracts = data.contract.filterIsInstance<ContractInternal>()

        val hackHoursBudget = internalContracts.map { it.totalHackDayHoursInPeriod(period) }.sum()
        val trainingHoursBudget = internalContracts.map { it.totalTrainingDayHoursInPeriod(period) }.sum()
        val trainingMoneyBudget = internalContracts.map { it.totalTrainingMoneyInPeriod(period) }.sum()

        val hackDays = data.eventDay.filter { it.event.allocationType == AllocationType.HACK }
        val trainingDays = data.eventDay.filter { it.event.allocationType == AllocationType.TRAINING }
        val hackHoursUsed = hackDays.sumOf { it.hours }.toBigDecimal()
        val trainingHoursUsed = trainingDays.sumOf { it.hours }.toBigDecimal()
        val trainingMoneyUsed = trainingDays.fold(BigDecimal.ZERO) { acc, day -> acc + (day.cost ?: BigDecimal.ZERO) }

        return PersonBudgetSummary(
            hackTimeBudget = PersonBudgetItem(hackHoursBudget, hackHoursUsed),
            trainingTimeBudget = PersonBudgetItem(trainingHoursBudget, trainingHoursUsed),
            trainingMoneyBudget = PersonBudgetItem(trainingMoneyBudget, trainingMoneyUsed),
        )
    }
}

data class PersonBudgetSummary(
    val hackTimeBudget: PersonBudgetItem,
    val trainingTimeBudget: PersonBudgetItem,
    val trainingMoneyBudget: PersonBudgetItem,
)

data class PersonBudgetItem(
    val budget: BigDecimal,
    val used: BigDecimal,
) {
    val available: BigDecimal get() = budget - used
}
