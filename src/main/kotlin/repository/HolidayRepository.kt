package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Holiday
import java.util.Optional
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface HolidayRepository : CrudRepository<Holiday, Long> {
    fun findByCode(code: String): Optional<Holiday>
    fun findAllByPersonCode(personCode: String): Iterable<Holiday>
    fun deleteByCode(code: String): Unit
}
