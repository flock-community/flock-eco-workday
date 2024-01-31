package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.interfaces.validate
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.EventRatingRepository
import community.flock.eco.workday.repository.EventRepository
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.UUID
import javax.persistence.EntityManager

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val eventRatingRepository: EventRatingRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager
) {
    fun findAll(): Iterable<Event> = eventRepository.findAll()
    fun findAll(sort: Sort): Iterable<Event> = eventRepository.findAll(sort)

    fun findAllByPersonUuid(personCode: UUID) = eventRepository
        .findAllByPersonsIsEmptyOrPersonsUuid(personCode)
    fun findByCode(code: String) = eventRepository.findByCode(code).toNullable()

    fun findAllActive(from: LocalDate, to: LocalDate): Iterable<Event> {
        val query = "SELECT e FROM Event e LEFT JOIN FETCH e.days WHERE e.from <= :to AND (e.to is null OR e.to >= :from)"
        return entityManager
            .createQuery(query, Event::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()
    }
    fun findAllActiveByPerson(from: LocalDate, to: LocalDate, personCode: UUID): Iterable<Event> {
        val query = "SELECT e FROM Event e LEFT JOIN FETCH e.days INNER JOIN e.persons p WHERE  e.from <= :to AND (e.to is null OR e.to >= :from) AND p.uuid = :personCode"
        return entityManager
            .createQuery(query, Event::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()
    }

    fun create(form: EventForm): Event = form
        .validate()
        .consume()
        .save()

    fun update(code: String, form: EventForm): Event = eventRepository
        .findByCode(code)
        .toNullable()
        .run {
            form
                .validate()
                .consume(this)
                .save()
        }

    fun subscribeToEvent(eventCode: String, person: Person): Event {
        return eventRepository.findByCode(eventCode).toNullable()
            ?.run {
                copy(persons = persons.filter { it.uuid != person.uuid }.plus(person))
                    .run { eventRepository.save(this) }
            } ?: error("Cannot subscribe to Event: ${eventCode}")
    }

    fun unsubscribeFromEvent(eventCode: String, person: Person): Event {
        return eventRepository.findByCode(eventCode).toNullable()
            ?.run {
                copy(persons = persons.filter { it.uuid != person.uuid })
                    .run { eventRepository.save(this) }
            } ?: error("Cannot unsubscribe from Event: ${eventCode}")
    }

    @Transactional
    fun deleteByCode(code: String) {
        eventRatingRepository.deleteByEventCode(code)
        eventRepository.deleteByCode(code)
    }

    private fun Event.save() = eventRepository.save(this)

    private fun EventForm.consume(it: Event? = null): Event {
        val persons = personService
            .findByPersonCodeIdIn(this.personIds)

        return Event(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            description = this.description,
            from = this.from,
            to = this.to,
            persons = persons.toList(),
            hours = this.hours,
            days = this.days,
            costs = this.costs,
            type = this.type
        )
    }
}
