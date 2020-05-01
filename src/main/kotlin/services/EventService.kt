package community.flock.eco.workday.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.workday.forms.EventForm
import community.flock.eco.workday.interfaces.validate
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.repository.EventRatingRepository
import community.flock.eco.workday.repository.EventRepository
import java.time.LocalDate
import java.util.UUID
import javax.persistence.EntityManager
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class EventService(
    private val eventRepository: EventRepository,
    private val eventRatingRepository: EventRatingRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager
) {
    fun findAll(): Iterable<Event> = eventRepository.findAll()
    fun findAll(sort: Sort): Iterable<Event> = eventRepository.findAll(sort)

    fun findByCode(code: String) = eventRepository.findByCode(code).toNullable()

    fun findAllActive(from: LocalDate, to: LocalDate): MutableList<Event> {
        val query = "SELECT e FROM Event e WHERE e.from <= :to AND (e.to is null OR e.to >= :from)"
        return entityManager
            .createQuery(query, Event::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
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

    @Transactional
    fun deleteByCode(code: String) {
        eventRatingRepository.deleteByEventCode(code)
        eventRepository.deleteByCode(code)
    }

    private fun Event.save() = eventRepository.save(this)

    private fun EventForm.consume(it: Event? = null): Event {
        val persons = personService
            .findByPersonCodeIdIn(this.personCodes)

        return Event(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            description = this.description,
            from = this.from,
            to = this.to,
            persons = persons.toList(),
            hours = this.hours,
            days = this.days
        )
    }
}
