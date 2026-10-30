package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.repository.PersonName
import community.flock.eco.workday.application.repository.PersonRepository
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class PeriodicReviewService(
    private val personRepository: PersonRepository,
    private val eventDayRepository: EventDayRepository,
) {
    /**
     * Active persons with a periodic review whose next one is due on or before [before]: six months
     * after their last review (a planned one in the future counts). Persons without any review are left out.
     */
    fun findAllDue(before: LocalDate): List<PeriodicReviewDue> =
        withLastReview(personRepository.findAllActiveNames())
            .filter { it.dueDate != null && !it.dueDate.isAfter(before) }
            .sortedBy { it.dueDate }

    /**
     * Every active person with an internal contract running on [on], with their last review and when
     * the next one is due. Persons who never had a review come first, then the longest ago.
     */
    fun findAllInternal(on: LocalDate): List<PeriodicReviewDue> =
        withLastReview(personRepository.findAllActiveInternalNames(on))
            .sortedWith(compareBy({ it.lastReview }, { it.person.firstname }, { it.person.lastname }))

    private fun withLastReview(persons: List<PersonName>): List<PeriodicReviewDue> {
        val lastReviews =
            eventDayRepository
                .findLastDatePerPersonByEventType(EventType.PERIODIC_REVIEW)
                .associate { it.personId to it.lastDate }

        return persons.map { person ->
            val lastReview = lastReviews[person.id]
            PeriodicReviewDue(person, lastReview, lastReview?.plusMonths(INTERVAL_MONTHS))
        }
    }

    companion object {
        const val INTERVAL_MONTHS = 6L
    }
}

data class PeriodicReviewDue(
    val person: PersonName,
    // Null when the person never had a review, and then nothing is due yet either.
    val lastReview: LocalDate?,
    val dueDate: LocalDate?,
)
