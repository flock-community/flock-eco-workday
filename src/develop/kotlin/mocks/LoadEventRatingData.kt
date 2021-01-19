package community.flock.eco.workday.mocks

import community.flock.eco.workday.forms.EventRatingForm
import community.flock.eco.workday.model.Event
import community.flock.eco.workday.model.EventRating
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.EventRatingService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadEventRatingData(
    loadPersonData: LoadPersonData,
    loadEventData: LoadEventData,
    private val service: EventRatingService
) {

    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    val data: MutableSet<EventRating> = mutableSetOf()

    init {

        val combined: List<Pair<Person, Event>> = loadPersonData.data
            .flatMap { person ->
                loadEventData.data
                    .map { event -> person to event }
            }

        combined
            .map { (person, event) ->
                EventRatingForm(
                    personId = person.uuid,
                    eventCode = event.code,
                    rating = 7
                )
            }
            .map {
                service.create(it)
            }
            .let {
                data.addAll(it)
            }
    }
}
