package community.flock.eco.workday.application.budget

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocationPersistencePort
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class MoneyAllocationPersistenceAdapter(
    private val repository: MoneyAllocationRepository,
    private val entityManager: EntityManager,
) : MoneyAllocationPersistencePort {
    @Transactional
    override fun create(allocation: MoneyAllocation): MoneyAllocation {
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference))
        entityManager.flush()
        return entity.toDomain()
    }

    @Transactional(readOnly = true)
    override fun findByCode(code: String): MoneyAllocation? = repository.findByCode(code)?.toDomain()

    @Transactional
    override fun updateByCode(
        code: String,
        allocation: MoneyAllocation,
    ): MoneyAllocation? {
        val existing = repository.findByCode(code) ?: return null
        val personReference = entityManager.getReference(Person::class.java, allocation.person.internalId)
        val entity = repository.save(allocation.toEntity(personReference, id = existing.id))
        entityManager.flush()
        return entity.toDomain()
    }
}
