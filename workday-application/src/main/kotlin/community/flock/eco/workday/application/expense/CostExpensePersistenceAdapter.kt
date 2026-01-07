package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.CostExpensePersistencePort
import jakarta.persistence.EntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class CostExpensePersistenceAdapter(
    private val costExpenseRepository: CostExpenseRepository,
    private val entityManager: EntityManager,
) : CostExpensePersistencePort {
    override fun create(costExpense: CostExpense): CostExpense {
        val personReference = entityManager.getReference(Person::class.java, costExpense.person.internalId)
        return costExpenseRepository
            .save(costExpense.toEntity(personReference))
            .toDomain()
    }

    override fun findById(id: UUID): CostExpense? =
        costExpenseRepository
            .findByIdOrNull(id)
            ?.toDomain()

    override fun updateIfExists(
        id: UUID,
        costExpense: CostExpense,
    ): CostExpense? {
        require(costExpense.id == id) { "Cannot update expense with different id" }
        return costExpenseRepository
            .existsById(id)
            .takeIf { it }
            ?.let {
                val personReference = entityManager.getReference(Person::class.java, costExpense.person.internalId)
                val entity = costExpense.toEntity(personReference)
                costExpenseRepository.save(entity) }
            ?.toDomain()
    }
}
