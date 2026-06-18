package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Event
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface EventRepository : JpaRepository<Event, Long> {
    fun findByCode(code: String): Optional<Event>

    fun deleteByCode(code: String)

    // eventDays (and their person) load via the EAGER @BatchSize mapping, not a
    // join fetch — a collection EntityGraph here would duplicate the event per attendee.
    fun findAllByFromBetween(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<Event>
}
