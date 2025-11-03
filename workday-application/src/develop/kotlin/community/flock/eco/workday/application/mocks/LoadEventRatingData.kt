package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.forms.EventRatingForm
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventRating
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.services.EventRatingService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadEventRatingData(
    private val service: EventRatingService,
    loadData: LoadData,
    loadPersonData: LoadPersonData,
    loadEventData: LoadEventData,
) {
    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    val data: MutableSet<EventRating> = mutableSetOf()

    init {

        loadData.loadWhenEmpty {

            val combined: List<Pair<Person, Event>> =
                loadPersonData.data
                    .flatMap { person ->
                        loadEventData.data
                            .map { event -> person to event }
                    }

            combined
                .map { (person, event) ->
                    EventRatingForm(
                        personId = person.uuid,
                        eventCode = event.code,
                        rating = 7,
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
}
