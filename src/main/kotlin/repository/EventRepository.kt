package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.Person
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface EventRepository : PagingAndSortingRepository<Event, Long> {
    fun findByCode(code: String): Optional<Event>
    fun findAllByPersonsIsEmptyOrPersonsCode(personCode: String): Iterable<Event>
    fun deleteByCode(code: String)
}
