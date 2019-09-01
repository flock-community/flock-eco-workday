package community.flock.eco.workday.repository

import community.flock.eco.feature.user.model.User
import community.flock.eco.workday.model.Period
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Service

@Service
interface PeriodRepository : CrudRepository<Period, Long> {
    fun findAllByUser(user: User): Iterable<Period>
}
