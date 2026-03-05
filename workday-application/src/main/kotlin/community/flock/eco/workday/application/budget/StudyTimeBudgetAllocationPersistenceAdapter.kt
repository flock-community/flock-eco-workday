package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocationPersistencePort
import jakarta.persistence.EntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class StudyTimeBudgetAllocationPersistenceAdapter(
    private val repository: StudyTimeBudgetAllocationRepository,
    private val entityManager: EntityManager,
) : StudyTimeBudgetAllocationPersistencePort {
    @Transactional
    override fun create(allocation: StudyTimeBudgetAllocation): StudyTimeBudgetAllocation {
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference))
        entityManager.flush()
        return entity.toDomain()
    }

    override fun findById(id: Long): StudyTimeBudgetAllocation? =
        repository.findByIdOrNull(id)?.toDomain()

    @Transactional
    override fun updateIfExists(
        id: Long,
        allocation: StudyTimeBudgetAllocation,
    ): StudyTimeBudgetAllocation? {
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
