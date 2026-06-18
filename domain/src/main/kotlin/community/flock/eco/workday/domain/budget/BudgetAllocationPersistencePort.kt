package community.flock.eco.workday.domain.budget

import java.util.UUID

interface BudgetAllocationPersistencePort {
    fun findAllByPersonUuid(
        personUuid: UUID,
        year: Int,
    ): List<BudgetAllocation>

    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>

    fun findByCode(code: String): BudgetAllocation?

    fun deleteByCode(code: String): BudgetAllocation?
}
