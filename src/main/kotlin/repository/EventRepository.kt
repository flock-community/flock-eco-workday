package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Event
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface EventRepository : PagingAndSortingRepository<Event, Long> {
    fun findByCode(code: String): Optional<Event>

    fun findAllByPersonsIsEmptyOrPersonsUuid(personCode: UUID): Iterable<Event>

    fun deleteByCode(code: String)
}
