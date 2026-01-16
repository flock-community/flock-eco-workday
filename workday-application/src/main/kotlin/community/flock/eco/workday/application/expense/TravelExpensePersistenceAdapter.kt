package community.flock.eco.workday.application.expense

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.expense.TravelExpensePersistencePort
import jakarta.persistence.EntityManager
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class TravelExpensePersistenceAdapter(
    private val travelExpenseRepository: TravelExpenseRepository,
    private val entityManager: EntityManager,
) : TravelExpensePersistencePort {
    override fun create(travelExpense: TravelExpense<*>): TravelExpense<*> {
        val personReference = entityManager.getReference(Person::class.java, travelExpense.person.internalId)
        return travelExpenseRepository
            .save(travelExpense.toEntity(personReference))
            .toDomain()
    }

    override fun findById(id: UUID): TravelExpense<*>? =
        travelExpenseRepository
            .findByIdOrNull(id)
            ?.toDomain()

    override fun updateIfExists(
        id: UUID,
        travelExpense: TravelExpense<*>,
    ): TravelExpense<*>? {
        require(travelExpense.id == id) { "Cannot update expense with different id" }
        return travelExpenseRepository
            .existsById(id)
            .takeIf { it }
            ?.let {
                val personReference = entityManager.getReference(Person::class.java, travelExpense.person.internalId)
                val entity = travelExpense.toEntity(personReference)
                travelExpenseRepository.save(entity)
            }?.toDomain()
    }
}
