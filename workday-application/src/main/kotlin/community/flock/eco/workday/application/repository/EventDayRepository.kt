package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.EventDay
import community.flock.eco.workday.application.model.EventType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

@Repository
interface EventDayRepository : JpaRepository<EventDay, Long> {
    @Query(
        "SELECT DISTINCT ed FROM EventDay ed " +
            "JOIN FETCH ed.event JOIN FETCH ed.person LEFT JOIN FETCH ed.days " +
            "WHERE ed.from <= :to AND (ed.to is null OR ed.to >= :from)",
    )
    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): List<EventDay>

    @Query(
        "SELECT DISTINCT ed FROM EventDay ed " +
            "JOIN FETCH ed.event JOIN FETCH ed.person LEFT JOIN FETCH ed.days " +
            "WHERE ed.from <= :to AND (ed.to is null OR ed.to >= :from) AND ed.person.uuid = :personCode",
    )
    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): List<EventDay>

    // One row per person, so memory stays flat however many events exist.
    @Query(
        "SELECT ed.person.id AS personId, MAX(ed.from) AS lastDate FROM EventDay ed " +
            "WHERE ed.event.type = :type GROUP BY ed.person.id",
    )
    fun findLastDatePerPersonByEventType(type: EventType): List<PersonLastDate>

    fun findAllByEventCode(eventCode: String): List<EventDay>

    fun deleteByEventCode(eventCode: String)

    fun deleteByEventCodeAndPersonUuid(
        eventCode: String,
        personUuid: UUID,
    )
}

interface PersonLastDate {
    val personId: Long
    val lastDate: LocalDate
}
