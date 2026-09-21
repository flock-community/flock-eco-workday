package community.flock.eco.workday.expense.domain

import java.util.UUID

interface TravelExpensePersistencePort {
    fun create(travelExpense: TravelExpense<*>): TravelExpense<*>

    fun findById(id: UUID): TravelExpense<*>?

    fun updateIfExists(
        id: UUID,
        travelExpense: TravelExpense<*>,
    ): TravelExpense<*>?
}
