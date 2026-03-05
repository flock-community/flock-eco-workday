package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocationPersistencePort
import jakarta.persistence.EntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class StudyMoneyBudgetAllocationPersistenceAdapter(
    private val repository: StudyMoneyBudgetAllocationRepository,
    private val entityManager: EntityManager,
) : StudyMoneyBudgetAllocationPersistencePort {
    @Transactional
    override fun create(allocation: StudyMoneyBudgetAllocation): StudyMoneyBudgetAllocation {
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference))
        entityManager.flush()
        return entity.toDomain()
    }

    override fun findById(id: Long): StudyMoneyBudgetAllocation? =
        repository.findByIdOrNull(id)?.toDomain()

    @Transactional
    override fun updateIfExists(
        id: Long,
        allocation: StudyMoneyBudgetAllocation,
    ): StudyMoneyBudgetAllocation? {
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
