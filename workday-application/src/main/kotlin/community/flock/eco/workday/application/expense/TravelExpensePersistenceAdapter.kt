package community.flock.eco.workday.application.expense

import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.domain.expense.TravelExpensePersistencePort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class TravelExpensePersistenceAdapter(
    private val travelExpenseRepository: TravelExpenseRepository,
) : TravelExpensePersistencePort {
    override fun create(travelExpense: TravelExpense): TravelExpense =
        travelExpenseRepository
            .save(travelExpense.toEntity())
            .toDomain()

    override fun findById(id: UUID): TravelExpense? =
        travelExpenseRepository
            .findByIdOrNull(id)
            ?.toDomain()

    override fun updateIfExists(
        id: UUID,
        travelExpense: TravelExpense,
    ): TravelExpense? {
        require(travelExpense.id == id) { "Cannot update expense with different id" }
        return travelExpenseRepository
            .existsById(id)
            .takeIf { it }
            ?.let { travelExpenseRepository.save(travelExpense.toEntity()) }
            ?.toDomain()
    }
}
