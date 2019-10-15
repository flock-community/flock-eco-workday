package community.flock.eco.workday.repository

import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.model.Holiday
import community.flock.eco.workday.model.Period
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service
import java.util.*

@Repository
interface HolidayRepository : CrudRepository<Holiday, Long> {
    fun findByCode(code: String): Optional<Holiday>
    fun findAllByUser(user: User): Iterable<Holiday>
    fun findAllByUserCode(userCode: String): Iterable<Holiday>
    fun deleteByCode(code: String): Unit
}
