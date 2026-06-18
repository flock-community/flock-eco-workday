package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Event
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional

@Repository
interface EventRepository : JpaRepository<Event, Long> {
    fun findByCode(code: String): Optional<Event>

    fun deleteByCode(code: String)

    @EntityGraph(
        type = EntityGraph.EntityGraphType.FETCH,
        attributePaths = ["eventDays", "eventDays.person"],
    )
    fun findAllByFromBetween(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<Event>
}
