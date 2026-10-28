package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.repository.PersonRepository
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class PeriodicReviewService(
    private val personRepository: PersonRepository,
    private val eventDayRepository: EventDayRepository,
) {
    /**
     * Active persons whose next periodic review is due on or before [before]: six months after
     * their last review (a planned one in the future counts), or straight away when they never had one.
     */
    fun findAllDue(before: LocalDate): List<PeriodicReviewDue> {
        val lastReviews =
            eventDayRepository
                .findLastDatePerPersonByEventType(EventType.PERIODIC_REVIEW)
                .associate { it.personId to it.lastDate }

        return personRepository
            .findAllByActive(Pageable.unpaged(), active = true)
            .map { person ->
                val lastReview = lastReviews[person.id]
                PeriodicReviewDue(person, lastReview, lastReview?.plusMonths(INTERVAL_MONTHS))
            }.filter { it.dueDate == null || !it.dueDate.isAfter(before) }
            .sortedWith(compareBy(nullsFirst()) { it.dueDate })
    }

    companion object {
        const val INTERVAL_MONTHS = 6L
    }
}

data class PeriodicReviewDue(
    val person: Person,
    val lastReview: LocalDate?,
    val dueDate: LocalDate?,
)
