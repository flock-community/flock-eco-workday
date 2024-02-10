package community.flock.eco.workday.repository

import community.flock.eco.workday.model.CostExpense
import community.flock.eco.workday.model.Expense
import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.TravelExpense
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.CrudRepository
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface ExpenseRepository : PagingAndSortingRepository<Expense, UUID> {
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
