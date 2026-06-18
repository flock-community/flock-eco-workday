package community.flock.eco.workday.application.budget

import community.flock.eco.workday.domain.budget.BudgetAllocation
import community.flock.eco.workday.domain.budget.BudgetAllocationPersistencePort
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Component
class BudgetAllocationPersistenceAdapter(
    private val timeRepository: TimeAllocationRepository,
    private val moneyRepository: MoneyAllocationRepository,
) : BudgetAllocationPersistencePort {
    @Transactional(readOnly = true)
    override fun findAllByPersonUuid(
        personUuid: UUID,
        year: Int,
    ): List<BudgetAllocation> =
        timeRepository.findAllByPersonUuidAndYear(personUuid, year).map { it.toDomain() } +
            moneyRepository.findAllByPersonUuidAndYear(personUuid, year).map { it.toDomain() }

    @Transactional(readOnly = true)
    override fun findAllByEventCode(eventCode: String): List<BudgetAllocation> =
        timeRepository.findAllByEventCode(eventCode).map { it.toDomain() } +
            moneyRepository.findAllByEventCode(eventCode).map { it.toDomain() }

    @Transactional(readOnly = true)
    override fun findByCode(code: String): BudgetAllocation? =
        timeRepository.findByCode(code)?.toDomain()
            ?: moneyRepository.findByCode(code)?.toDomain()

    @Transactional
    override fun deleteByCode(code: String): BudgetAllocation? =
        timeRepository
            .findByCode(code)
            ?.let {
                val domain = it.toDomain()
                timeRepository.delete(it)
                domain
            } ?: moneyRepository
            .findByCode(code)
            ?.let {
                val domain = it.toDomain()
                moneyRepository.delete(it)
                domain
            }
}
