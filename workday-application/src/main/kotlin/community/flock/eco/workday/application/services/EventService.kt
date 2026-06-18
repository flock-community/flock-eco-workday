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
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.also { event ->
                if (event.eventDays.none { it.person.uuid == person.uuid }) {
                    eventDayRepository.save(event.eventDayFor(person))
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
                ),
            )
        val persons = personService.findByPersonCodeIdIn(personIds).toList()
        event.reconcileEventDays(persons)
        return event.refreshed()
    }

    private fun Event.reconcileEventDays(persons: List<Person>) {
        val desired = persons.associateBy { it.uuid }
        val current = eventDayRepository.findAllByEventCode(code)
        current
            .filter { it.person.uuid !in desired.keys }
            .forEach { eventDayRepository.delete(it) }
        val present = current.map { it.person.uuid }.toSet()
        persons
            .filter { it.uuid !in present }
            .forEach { eventDayRepository.save(eventDayFor(it)) }
    }

    private fun Event.eventDayFor(person: Person) =
        EventDay(
            from = from,
            to = to,
            hours = hours,
            days = days?.toMutableList(),
            person = person,
            event = this,
        )

    private fun Event.refreshed(): Event =
        also {
            entityManager.flush()
            entityManager.refresh(it)
        }
}
