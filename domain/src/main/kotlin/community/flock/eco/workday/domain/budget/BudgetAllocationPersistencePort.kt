package community.flock.eco.workday.domain.budget

import java.util.UUID

interface BudgetAllocationPersistencePort {
    fun findAllByPersonUuid(
        personUuid: UUID,
        year: Int,
    ): List<BudgetAllocation>

    fun findAllByEventCode(eventCode: String): List<BudgetAllocation>

    fun findById(id: Long): BudgetAllocation?

    fun delete(id: Long): BudgetAllocation?
}
