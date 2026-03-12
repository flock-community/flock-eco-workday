package community.flock.eco.workday.application.budget

import community.flock.eco.workday.api.model.BudgetItem
import community.flock.eco.workday.api.model.BudgetSummaryResponse
import community.flock.eco.workday.application.model.ContractInternal
import community.flock.eco.workday.application.services.ContractService
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.util.UUID

@Service
class BudgetSummaryService(
    private val contractService: ContractService,
    private val budgetAllocationService: BudgetAllocationService,
) {
    fun getSummary(personUuid: UUID, year: Int): BudgetSummaryResponse {
        val from = LocalDate.of(year, 1, 1)
        val to = LocalDate.of(year, 12, 31)

        // Find active internal contracts for person in the given year
        val internalContracts = contractService
            .findAllActiveByPerson(from, to, personUuid)
            .filterIsInstance<ContractInternal>()

        // Sum budget from all active internal contracts
        val totalHackHours = internalContracts.sumOf { it.hackHours }.toDouble()
        val totalStudyHours = internalContracts.sumOf { it.studyHours }.toDouble()
        val totalStudyMoney = internalContracts.sumOf { it.studyMoney.toDouble() }

        // Get allocations for the person in the given year
        val allocations = budgetAllocationService.findAllByPersonUuid(personUuid, year)

        // Sum used amounts from allocations
        val usedHackHours = allocations
            .filterIsInstance<HackTimeBudgetAllocation>()
            .sumOf { it.totalHours }

        val usedStudyHours = allocations
            .filterIsInstance<StudyTimeBudgetAllocation>()
            .sumOf { it.totalHours }

        val usedStudyMoney = allocations
            .filterIsInstance<StudyMoneyBudgetAllocation>()
            .sumOf { it.amount.toDouble() }

        return BudgetSummaryResponse(
            hackHours = BudgetItem(
                budget = totalHackHours,
                used = usedHackHours,
                available = totalHackHours - usedHackHours,
            ),
            studyHours = BudgetItem(
                budget = totalStudyHours,
                used = usedStudyHours,
                available = totalStudyHours - usedStudyHours,
            ),
            studyMoney = BudgetItem(
                budget = totalStudyMoney,
                used = usedStudyMoney,
                available = totalStudyMoney - usedStudyMoney,
            ),
        )
    }
}
