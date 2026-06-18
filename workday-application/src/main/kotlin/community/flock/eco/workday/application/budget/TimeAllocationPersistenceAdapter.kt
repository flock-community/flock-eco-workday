package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.TimeAllocation
import community.flock.eco.workday.domain.budget.TimeAllocationPersistencePort
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class TimeAllocationPersistenceAdapter(
    private val repository: TimeAllocationRepository,
    private val entityManager: EntityManager,
) : TimeAllocationPersistencePort {
    @Transactional
    override fun create(allocation: TimeAllocation): TimeAllocation {
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference))
        entityManager.flush()
        return entity.toDomain()
    }

    @Transactional(readOnly = true)
    override fun findByCode(code: String): TimeAllocation? = repository.findByCode(code)?.toDomain()

    @Transactional
    override fun updateByCode(
        code: String,
        allocation: TimeAllocation,
    ): TimeAllocation? {
        val existing = repository.findByCode(code) ?: return null
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference, id = existing.id))
        entityManager.flush()
        return entity.toDomain()
    }
}
