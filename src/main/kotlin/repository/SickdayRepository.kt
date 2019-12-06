package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Sickday
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface SickdayRepository : CrudRepository<Sickday, Long> {
    fun findByCode(code: String): Sickday?
    fun deleteByCode(code: String)
}
