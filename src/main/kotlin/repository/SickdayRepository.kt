package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Sickday
import java.util.Optional
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface SickdayRepository : CrudRepository<Sickday, Long> {
    fun findByCode(code: String): Optional<Sickday>
    fun deleteByCode(code: String)
    fun findAllByPersonCode(personCode: String): Iterable<Sickday>
    fun findAllByPersonUserCode(userCode: String): Iterable<Sickday>
}
