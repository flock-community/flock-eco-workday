package community.flock.eco.workday.application.budget

import community.flock.eco.workday.api.model.BudgetItem
import community.flock.eco.workday.api.model.BudgetSummaryResponse
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.services.ContractService
import community.flock.eco.workday.domain.budget.AllocationType
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.TimeAllocation
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class BudgetSummaryService(
    private val contractService: ContractService,
    private val budgetAllocationService: BudgetAllocationService,
) {
    fun getSummary(
        personUuid: UUID,
        year: Int,
    ): BudgetSummaryResponse {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)

        val internalContracts =
            contractService
                .findAllActiveByPerson(from, to, personUuid)
                .filterIsInstance<ContractInternal>()

        val totalHackHours = internalContracts.sumOf { it.hackTimeBudget }.toDouble()
        val totalTrainingHours = internalContracts.sumOf { it.trainingTimeBudget }.toDouble()
        val totalTrainingMoney = internalContracts.sumOf { it.trainingMoneyBudget.toDouble() }

        val allocations = budgetAllocationService.findAllByPersonUuid(personUuid, year)
        val dailyAllocations = allocations.filterIsInstance<TimeAllocation>().flatMap { it.dailyAllocations }

        val usedHackHours = dailyAllocations.filter { it.type == AllocationType.HACK }.sumOf { it.hours }
        val usedTrainingHours = dailyAllocations.filter { it.type == AllocationType.TRAINING }.sumOf { it.hours }
        val usedTrainingMoney = allocations.filterIsInstance<MoneyAllocation>().sumOf { it.amount.toDouble() }

        return BudgetSummaryResponse(
            hackTimeBudget =
                BudgetItem(
                    budget = totalHackHours,
                    used = usedHackHours,
                    available = totalHackHours - usedHackHours,
                ),
            trainingTimeBudget =
                BudgetItem(
                    budget = totalTrainingHours,
                    used = usedTrainingHours,
                    available = totalTrainingHours - usedTrainingHours,
                ),
            trainingMoneyBudget =
                BudgetItem(
                    budget = totalTrainingMoney,
                    used = usedTrainingMoney,
                    available = totalTrainingMoney - usedTrainingMoney,
                ),
        )
    }
}
