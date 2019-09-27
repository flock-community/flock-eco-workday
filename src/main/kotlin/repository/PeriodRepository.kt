package community.flock.eco.workday.repository

import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.model.Period
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service

@Repository
interface PeriodRepository : CrudRepository<Period, Long> {
    fun findAllByUser(user: User): Iterable<Period>
    fun findAllByUserCode(userCode: String): Iterable<Period>
}
