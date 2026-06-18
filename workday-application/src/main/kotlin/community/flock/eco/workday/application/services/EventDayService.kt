package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.EventDay
import community.flock.eco.workday.application.repository.EventDayRepository
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class EventDayService(
    private val eventDayRepository: EventDayRepository,
    private val entityManager: EntityManager,
) {
    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<EventDay> =
        entityManager
            .createQuery(activeQuery(byPerson = false), EventDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): Iterable<EventDay> =
        entityManager
            .createQuery(activeQuery(byPerson = true), EventDay::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()

    private fun activeQuery(byPerson: Boolean) =
        buildString {
            append("SELECT DISTINCT ed FROM EventDay ed ")
            append("JOIN FETCH ed.event JOIN FETCH ed.person LEFT JOIN FETCH ed.days ")
            append("WHERE ed.from <= :to AND (ed.to is null OR ed.to >= :from)")
            if (byPerson) append(" AND ed.person.uuid = :personCode")
        }

    fun deleteByEventCode(eventCode: String) = eventDayRepository.deleteByEventCode(eventCode)
}
