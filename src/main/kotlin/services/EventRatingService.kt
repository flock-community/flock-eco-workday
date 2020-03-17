package community.flock.eco.workday.services

import community.flock.eco.workday.forms.EventRatingForm
import community.flock.eco.workday.model.EventRating
import community.flock.eco.workday.repository.EventRatingRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class EventRatingService(
    private val eventRatingRepository: EventRatingRepository,
    private val personService: PersonService,
    private val eventService: EventService
) {

    fun findAll(): Iterable<EventRating> = eventRatingRepository.findAll()

    fun create(form: EventRatingForm) = form
        .consume()
        .save()

    fun EventRatingForm.consume(): EventRating {
        val person = personService.findByCode(personCode) ?: error("Cannot find person")
        val event = eventService.findByCode(eventCode) ?: error("Cannot find event")
        return EventRating(
            person = person,
            event = event,
            rating = rating
        )
    }

    fun EventRating.save(): EventRating = eventRatingRepository.save(this)

    fun findByEventCode(eventCode: String) = eventRatingRepository.findByEventCode(eventCode)

    @Transactional
    fun deleteByEventCodeAndPersonCode(eventCode: String, personCode: String) = eventRatingRepository.deleteByEventCodeAndPersonCode(eventCode, personCode)

}
