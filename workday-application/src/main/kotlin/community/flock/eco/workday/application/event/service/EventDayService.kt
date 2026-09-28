package community.flock.eco.workday.application.event.service

import community.flock.eco.workday.application.event.model.EventDay
import community.flock.eco.workday.application.event.persistence.EventDayRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class EventDayService(
    private val eventDayRepository: EventDayRepository,
) {
    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<EventDay> = eventDayRepository.findAllActive(from, to)

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): Iterable<EventDay> = eventDayRepository.findAllActiveByPerson(from, to, personCode)

    fun deleteByEventCode(eventCode: String) = eventDayRepository.deleteByEventCode(eventCode)
}
