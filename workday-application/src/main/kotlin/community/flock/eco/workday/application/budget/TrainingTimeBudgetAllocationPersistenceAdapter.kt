package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocationPersistencePort
import jakarta.persistence.EntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class TrainingTimeBudgetAllocationPersistenceAdapter(
    private val repository: TrainingTimeBudgetAllocationRepository,
    private val entityManager: EntityManager,
) : TrainingTimeBudgetAllocationPersistencePort {
    @Transactional
    override fun create(allocation: TrainingTimeBudgetAllocation): TrainingTimeBudgetAllocation {
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference))
        entityManager.flush()
        return entity.toDomain()
    }

    override fun findById(id: Long): TrainingTimeBudgetAllocation? = repository.findByIdOrNull(id)?.toDomain()

    @Transactional
    override fun updateIfExists(
        id: Long,
        allocation: TrainingTimeBudgetAllocation,
    ): TrainingTimeBudgetAllocation? {
        require(allocation.id == id) { "Cannot update allocation with different id" }
        return repository
            .existsById(id)
            .takeIf { it }
            ?.let {
                val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
                val entity = repository.save(allocation.toEntity(personReference))
                entityManager.flush()
                entity
            }?.toDomain()
    }
}
