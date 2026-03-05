package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationPersistencePort
import jakarta.persistence.EntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class HackTimeBudgetAllocationPersistenceAdapter(
    private val repository: HackTimeBudgetAllocationRepository,
    private val entityManager: EntityManager,
) : HackTimeBudgetAllocationPersistencePort {
    @Transactional
    override fun create(allocation: HackTimeBudgetAllocation): HackTimeBudgetAllocation {
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference))
        entityManager.flush()
        return entity.toDomain()
    }

    override fun findById(id: Long): HackTimeBudgetAllocation? =
        repository.findByIdOrNull(id)?.toDomain()

    @Transactional
    override fun updateIfExists(
        id: Long,
        allocation: HackTimeBudgetAllocation,
    ): HackTimeBudgetAllocation? {
        require(allocation.id == id) { "Cannot update allocation with different id" }
        return repository
            .existsById(id)
            .takeIf { it }
            ?.let {
                val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
                repository.save(allocation.toEntity(personReference))
            }?.toDomain()
    }
}
