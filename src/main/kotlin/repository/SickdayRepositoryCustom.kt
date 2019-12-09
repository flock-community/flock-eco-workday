package community.flock.eco.workday.repository

import community.flock.eco.workday.filters.SickdayFilters
import org.springframework.stereotype.Repository

@Repository
interface SickdayRepositoryCustom {
    fun filterBy(status: SickdayFilters?, personCode: Int?): Iterable<Any?>
}
