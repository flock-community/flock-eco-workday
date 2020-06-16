package community.flock.eco.workday.repository

import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.Status
import java.util.Optional
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface HolidayRepository : CrudRepository<HoliDay, Long> {
    fun findByCode(code: String): Optional<HoliDay>
    fun findAllByPersonCode(personCode: String): Iterable<HoliDay>
    fun findAllByPersonUserCode(personCode: String): Iterable<HoliDay>
    fun findAllByStatus(status: Status):Iterable<HoliDay>
    fun deleteByCode(code: String): Unit
}
