package community.flock.eco.holidays.repository

import community.flock.eco.feature.user.model.User
import community.flock.eco.holidays.model.Holiday
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Service

@Service
interface HolidayRepository : CrudRepository <Holiday, Long>{
    fun findAllByUser(user: User): Iterable<Holiday>
}