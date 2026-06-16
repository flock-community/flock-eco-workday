package community.flock.eco.workday.domain.budget

import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import java.util.UUID

class BudgetAllocationService(
    private val budgetAllocationRepository: BudgetAllocationPersistencePort,
    private val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun findAllByPersonUuid(
        personUuid: UUID,
        year: Int,
    ): List<BudgetAllocation> = budgetAllocationRepository.findAllByPersonUuid(personUuid, year)

    fun findAllByEventCode(eventCode: String): List<BudgetAllocation> = budgetAllocationRepository.findAllByEventCode(eventCode)

    fun findById(id: Long): BudgetAllocation? = budgetAllocationRepository.findById(id)

    fun deleteById(id: Long): BudgetAllocation? =
        budgetAllocationRepository
            .delete(id)
            ?.also { applicationEventPublisher.publishEvent(DeleteBudgetAllocationEvent(it)) }
}
