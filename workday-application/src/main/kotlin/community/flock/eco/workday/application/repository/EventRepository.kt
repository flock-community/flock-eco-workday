package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.PersonProjection
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@Repository
interface EventRepository : JpaRepository<Event, Long> {
    fun findByCode(code: String): Optional<Event>

    fun findAllByPersonsIsEmptyOrPersonsUuid(personCode: UUID): Iterable<Event>

    fun deleteByCode(code: String)

    @EntityGraph(
        type = EntityGraph.EntityGraphType.FETCH,
        attributePaths = ["persons"],
    )
    fun findAllByTypeIsAndFromBetween(
        type: EventType,
        from: LocalDate,
        to: LocalDate,
    ): Iterable<EventProjection>
}

interface EventProjection {
    fun getDescription(): String

    fun getCode(): String

    fun getFrom(): LocalDate

    fun getTo(): LocalDate

    fun getType(): EventType

    fun getPersons(): List<PersonProjection>
}
