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
    fun findAllDue(before: LocalDate): List<PeriodicReviewDue> {
        val lastReviews =
            eventDayRepository
                .findLastDatePerPersonByEventType(EventType.PERIODIC_REVIEW)
                .associate { it.personId to it.lastDate }

        return personRepository
            .findAllActiveNames()
            .mapNotNull { person ->
                lastReviews[person.id]?.let { PeriodicReviewDue(person, it, it.plusMonths(INTERVAL_MONTHS)) }
            }.filter { !it.dueDate.isAfter(before) }
            .sortedBy { it.dueDate }
    }

    companion object {
        const val INTERVAL_MONTHS = 6L
    }
}

data class PeriodicReviewDue(
    val person: PersonName,
    val lastReview: LocalDate,
    val dueDate: LocalDate,
)
