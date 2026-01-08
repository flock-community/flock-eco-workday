package community.flock.eco.workday.application.expense

import community.flock.eco.workday.domain.common.Status
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ExpenseRepository : JpaRepository<Expense, UUID> {
    fun findAllByPersonUuid(
        personUuid: UUID,
        pageable: Pageable,
    ): Page<Expense>

    fun findAllByPersonUserCode(
        personCode: String,
        pageable: Pageable,
    ): Page<Expense>

    fun findAllByStatus(status: Status): Iterable<Expense>
}

@Repository
interface TravelExpenseRepository : CrudRepository<TravelExpense, UUID>

@Repository
interface CostExpenseRepository : CrudRepository<CostExpense, UUID>
