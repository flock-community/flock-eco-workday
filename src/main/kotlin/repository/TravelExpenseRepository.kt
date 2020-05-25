package community.flock.eco.workday.repository

import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.TravelExpense
import java.util.Optional
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface TravelExpenseRepository : CrudRepository<TravelExpense, Long> {
    fun findByCode(code: String): Optional<TravelExpense>
    fun deleteByCode(code: String)
}
