package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Sickday
import community.flock.eco.workday.model.SickdayStatus
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface SickdayRepository : CrudRepository<Sickday, Long> {
    fun findByCode(code: String): Sickday?
    fun deleteByCode(code: String)
    fun findAllByStatusAndPersonCode(status: SickdayStatus?, personCode: String?): Iterable<Sickday>
    fun findAllByStatus(status: SickdayStatus): Iterable<Sickday>
    fun findAllByPersonCode(personCode: String): Iterable<Sickday>
}
