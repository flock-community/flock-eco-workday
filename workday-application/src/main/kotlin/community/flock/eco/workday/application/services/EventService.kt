package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.interfaces.validate
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventProjection
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
    private val eventRatingRepository: EventRatingRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager,
) {
    fun findAll(): Iterable<Event> = eventRepository.findAll()

    fun findAll(pageable: Pageable): Page<Event> = eventRepository.findAll(pageable)

    fun findAllByPersonUuid(personCode: UUID) =
        eventRepository
            .findAllByPersonsIsEmptyOrPersonsUuid(personCode)

    fun findByCode(code: String) = eventRepository.findByCode(code).toNullable()

    fun findAllHackDaysOf(year: Int): Iterable<EventProjection> =
        eventRepository.findAllByTypeIsAndFromBetween(
            type = EventType.FLOCK_HACK_DAY,
            from = LocalDate.of(year, 1, 1),
            to = LocalDate.of(year, 12, 31),
        )

    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<Event> {
        val query =
            "SELECT e FROM Event e LEFT JOIN FETCH e.days WHERE e.from <= :to AND (e.to is null OR e.to >= :from)"
        return entityManager
            .createQuery(query, Event::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()
    }

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): Iterable<Event> {
        val query =
            """SELECT e
                |FROM Event e
                |LEFT JOIN FETCH e.days
                |INNER JOIN e.persons p
                |WHERE  e.from <= :to
                |AND (e.to is null OR e.to >= :from)
                |AND p.uuid = :personCode
            """.trimMargin()
        return entityManager
            .createQuery(query, Event::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()
    }

    fun create(form: EventForm): Event =
        form
            .validate()
            .consume()
            .save()

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
                    .save()
            }

    fun subscribeToEvent(
        eventCode: String,
        person: Person,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.run {
                Event(
                    description = description,
                    id = id,
                    code = code,
                    from = from,
                    to = to,
                    hours = hours,
                    costs = costs,
                    type = type,
                    days = days,
                    persons = persons.filter { it.uuid != person.uuid }.plus(person).toMutableList(),
                ).run { eventRepository.save(this) }
            } ?: error("Cannot subscribe to Event: $eventCode")

    fun unsubscribeFromEvent(
        eventCode: String,
        person: Person,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.run {
                Event(
                    description = description,
                    id = id,
                    code = code,
                    from = from,
                    to = to,
                    hours = hours,
                    costs = costs,
                    type = type,
                    days = days,
                    persons = persons.filter { it.uuid != person.uuid }.toMutableList(),
                ).run { eventRepository.save(this) }
            } ?: error("Cannot unsubscribe from Event: $eventCode")

    @Transactional
    fun deleteByCode(code: String) {
        eventRatingRepository.deleteByEventCode(code)
        eventRepository.deleteByCode(code)
    }

    private fun Event.save() = eventRepository.save(this)

    private fun EventForm.consume(it: Event? = null): Event {
        val persons =
            personService
                .findByPersonCodeIdIn(personIds)

        return Event(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            description = description,
            from = from,
            to = to,
            persons = persons.toMutableList(),
            hours = hours,
            days = days.toMutableList(),
            costs = costs,
            type = type,
        )
    }
}
