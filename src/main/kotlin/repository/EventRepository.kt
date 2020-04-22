package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Event
import java.util.Optional
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface EventRepository : PagingAndSortingRepository<Event, Long> {
    fun findByCode(code: String): Optional<Event>
    fun deleteByCode(code: String)
}
