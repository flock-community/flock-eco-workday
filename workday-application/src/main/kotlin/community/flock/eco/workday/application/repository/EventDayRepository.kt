package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.EventDay
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

    fun findAllByEventCode(eventCode: String): List<EventDay>

    fun deleteByEventCode(eventCode: String)

    fun deleteByEventCodeAndPersonUuid(
        eventCode: String,
        personUuid: UUID,
    )
}
