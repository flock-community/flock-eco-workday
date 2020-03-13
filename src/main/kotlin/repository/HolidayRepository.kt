package community.flock.eco.workday.repository

import community.flock.eco.workday.model.HoliDay
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface HolidayRepository : CrudRepository<HoliDay, Long> {
    fun findByCode(code: String): Optional<HoliDay>
    fun findAllByPersonCode(personCode: String): Iterable<HoliDay>
    fun findAllByPersonUserCode(personCode: String): Iterable<HoliDay>
    fun deleteByCode(code: String): Unit
}
