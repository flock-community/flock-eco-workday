package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocation
import community.flock.eco.workday.domain.budget.BudgetAllocationPersistencePort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class BudgetAllocationPersistenceAdapter(
    private val repository: BudgetAllocationRepository,
) : BudgetAllocationPersistencePort {
    @Transactional(readOnly = true)
    override fun findAllByPersonUuid(
        personUuid: UUID,
        year: Int,
    ): List<BudgetAllocation> =
        repository
            .findAllByPersonUuidAndYear(personUuid, year)
            .map { it.toBudgetAllocationDomain() }

    @Transactional(readOnly = true)
    override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> =
        repository
            .findAllByEventCode(eventCode)
            .map { it.toBudgetAllocationDomain() }

    @Transactional(readOnly = true)
    override fun findById(id: Long): BudgetAllocation? =
        repository
            .findByIdOrNull(id)
            ?.toBudgetAllocationDomain()

    @Transactional
    override fun delete(id: Long): BudgetAllocation? =
        repository
            .findByIdOrNull(id)
            ?.run {
                val domain = toBudgetAllocationDomain()
                repository.delete(this)
                domain
            }
}
