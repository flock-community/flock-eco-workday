package community.flock.eco.workday.repository

import community.flock.eco.workday.filters.SickdayFilters
import org.springframework.stereotype.Repository

@Repository
interface SickdayRepositoryCustom {
    fun filterBy(filter: SickdayFilters): Iterable<Any?>
}
