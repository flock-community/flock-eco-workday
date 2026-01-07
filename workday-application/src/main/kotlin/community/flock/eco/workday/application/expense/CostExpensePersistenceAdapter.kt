package community.flock.eco.workday.application.expense

import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.CostExpensePersistencePort
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Component
import java.util.UUID

@Component
class CostExpensePersistenceAdapter(
    private val costExpenseRepository: CostExpenseRepository,
) : CostExpensePersistencePort {
    override fun create(costExpense: CostExpense): CostExpense =
        costExpenseRepository
            .save(costExpense.toEntity())
            .toDomain()

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
            ?.let { costExpenseRepository.save(costExpense.toEntity()) }
            ?.toDomain()
    }
}
