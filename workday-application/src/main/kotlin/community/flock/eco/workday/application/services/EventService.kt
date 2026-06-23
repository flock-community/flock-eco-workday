package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.interfaces.validate
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventDay
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.repository.EventRatingRepository
import community.flock.eco.workday.application.repository.EventRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.persistence.EntityManager
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class EventService(
    private val eventRepository: EventRepository,
    private val eventDayRepository: EventDayRepository,
    private val eventRatingRepository: EventRatingRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager,
) {
    fun findAll(): Iterable<Event> = eventRepository.findAll()

    fun findAll(pageable: Pageable): Page<Event> = eventRepository.findAll(pageable)

    fun findByCode(code: String) = eventRepository.findByCode(code).toNullable()

    fun findAllEventsOf(year: Int): Iterable<Event> =
        eventRepository.findAllByFromBetween(
            from = LocalDate.of(year, 1, 1),
            to = LocalDate.of(year, 12, 31),
        )

    fun create(form: EventForm): Event =
        form
            .validate()
            .consume()

    fun update(
        code: String,
        form: EventForm,
    ): Event =
        eventRepository
            .findByCode(code)
            .toNullable()
            .run {
                form
                    .validate()
                    .consume(this)
            }

    fun subscribeToEvent(
        eventCode: String,
        person: Person,
        hours: Double? = null,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.also { event ->
                val existing = event.eventDays.firstOrNull { it.person.uuid == person.uuid }
                when {
                    existing == null -> eventDayRepository.save(event.eventDayFor(person, hours = hours ?: event.hours))
                    hours != null && hours != existing.hours -> eventDayRepository.save(existing.withHours(hours))
                }
            }?.refreshed()
            ?: error("Cannot subscribe to Event: $eventCode")

    fun unsubscribeFromEvent(
        eventCode: String,
        person: Person,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.also { eventDayRepository.deleteByEventCodeAndPersonUuid(eventCode, person.uuid) }
            ?.refreshed()
            ?: error("Cannot unsubscribe from Event: $eventCode")

    @Transactional
    fun deleteByCode(code: String) {
        eventRatingRepository.deleteByEventCode(code)
        eventDayRepository.deleteByEventCode(code)
        eventRepository.deleteByCode(code)
    }

    private fun EventForm.consume(existing: Event? = null): Event {
        val event =
            eventRepository.save(
                Event(
                    id = existing?.id ?: 0L,
                    code = existing?.code ?: UUID.randomUUID().toString(),
                    description = description,
                    from = from,
                    to = to,
                    hours = hours,
                    days = days.toMutableList(),
                    costs = costs,
                    type = type,
                    budgetCategory = budgetCategory,
                ),
            )
        val persons = personService.findByPersonCodeIdIn(personIds).toList()
        event.rebuildEventDaysFromTemplate(persons)
        return event.refreshed()
    }

    // Rebuilt (not membership-diffed) so an edited period/hours/days reaches every
    // participant — each EventDay holds its own copy of those values.
    private fun Event.rebuildEventDaysFromTemplate(persons: List<Person>) {
        eventDayRepository.deleteAll(eventDayRepository.findAllByEventCode(code))
        val costShares = splitEvenly(costs.toBigDecimal(), persons.size)
        persons.forEachIndexed { index, person ->
            eventDayRepository.save(eventDayFor(person, costShares[index]))
        }
    }

    private fun Event.eventDayFor(
        person: Person,
        cost: BigDecimal? = null,
        hours: Double = this.hours,
    ) = EventDay(
        from = from,
        to = to,
        hours = hours,
        days = days?.toMutableList(),
        cost = cost,
        person = person,
        event = this,
    )

    private fun EventDay.withHours(hours: Double) =
        EventDay(
            id = id,
            code = code,
            from = from,
            to = to,
            hours = hours,
            days = days?.toMutableList(),
            cost = cost,
            person = person,
            event = event,
        )

    private fun splitEvenly(
        total: BigDecimal,
        count: Int,
    ): List<BigDecimal> {
        if (count <= 0) return emptyList()
        val cents = total.movePointRight(2).setScale(0, RoundingMode.HALF_UP).toLong()
        val base = cents / count
        val remainder = (cents % count).toInt()
        return (0 until count).map { index ->
            BigDecimal.valueOf(base + if (index < remainder) 1L else 0L, 2)
        }
    }

    private fun Event.refreshed(): Event =
        also {
            entityManager.flush()
            entityManager.refresh(it)
        }
}
