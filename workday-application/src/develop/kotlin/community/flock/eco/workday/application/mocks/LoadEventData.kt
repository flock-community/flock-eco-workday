package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.model.AllocationType
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.services.EventService
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate
import kotlin.random.Random
import kotlin.random.Random.Default

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadEventData(
    private val service: EventService,
    loadData: LoadData,
    loadPersonData: LoadPersonData,
) {
    private final var random = Random(Default.nextInt())
    final val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    final val data: MutableList<Event> = mutableListOf()

    init {
        loadData.load {
            (
                publicHolidays(loadPersonData) + communityDays(loadPersonData) + conferences(loadPersonData) +
                    hackDays(loadPersonData) + trainingEvents(loadPersonData)
            ).map { it.create() }
                .let { data.addAll(it) }
        }
    }

    private fun trainingEvents(loadPersonData: LoadPersonData) =
        listOf(
            EventForm(
                description = "Kotlin Conf (training)",
                from = LocalDate.of(now.year, 6, 10),
                to = LocalDate.of(now.year, 6, 11),
                days = mutableListOf(8.0, 8.0),
                hours = 16.0,
                personIds = loadPersonData.data.take(3).map { it.uuid },
                costs = 2400.0,
                type = EventType.CONFERENCE,
                defaultTimeAllocationType = AllocationType.TRAINING,
            ),
            EventForm(
                description = "Personal study budget",
                from = LocalDate.of(now.year, 9, 2),
                to = LocalDate.of(now.year, 9, 2),
                days = mutableListOf(8.0),
                hours = 8.0,
                personIds = listOf(loadPersonData.findPersonByUserEmail("bert@sesam.straat").uuid),
                costs = 450.0,
                type = EventType.GENERAL_EVENT,
                defaultTimeAllocationType = AllocationType.TRAINING,
            ),
        )

    private fun publicHolidays(loadPersonData: LoadPersonData) =
        listOf(
            EventForm(
                description = "New years eve",
                from = LocalDate.of(now.year, 1, 1),
                to = LocalDate.of(now.year, 1, 1),
                days = mutableListOf(8.0),
                hours = 8.0,
                personIds = loadPersonData.data.map { it.uuid },
                costs = 1000.0,
                type = EventType.GENERAL_EVENT,
            ),
            EventForm(
                description = "King's Day",
                from = LocalDate.of(now.year, 4, 27),
                to = LocalDate.of(now.year, 4, 27),
                days = mutableListOf(8.0),
                hours = 8.0,
                personIds = loadPersonData.data.map { it.uuid },
                costs = random.nextDouble(10.0, 1000.0),
                type = EventType.GENERAL_EVENT,
            ),
            EventForm(
                description = "Halloween",
                from = LocalDate.of(now.year, 10, 31),
                to = LocalDate.of(now.year, 10, 31),
                days = mutableListOf(2.0),
                hours = 2.0,
                personIds = loadPersonData.data.map { it.uuid },
                costs = random.nextDouble(1.0, 20.0),
                type = EventType.GENERAL_EVENT,
            ),
        )

    private fun communityDays(loadPersonData: LoadPersonData): List<EventForm> {
        val communityDays = mutableListOf<EventForm>()
        repeat(3) { i ->
            communityDays.add(
                EventForm(
                    description = "Flock. Community Day",
                    from = LocalDate.of(now.year, (i + 1) * 3, 12),
                    to = LocalDate.of(now.year, (i + 1) * 3, 12),
                    days = mutableListOf(7.0),
                    hours = 7.0,
                    personIds = loadPersonData.data.map { it.uuid },
                    costs = 750.0,
                    type = EventType.FLOCK_COMMUNITY_DAY,
                ),
            )
        }
        return communityDays.toList()
    }

    private fun conferences(loadPersonData: LoadPersonData) =
        listOf(
            EventForm(
                description = "Conference",
                from = LocalDate.of(now.year, 5, 27),
                to = LocalDate.of(now.year, 5, 29),
                days = mutableListOf(8.0, 8.0, 8.0),
                hours = 24.0,
                personIds = loadPersonData.data.take(2).map { it.uuid },
                costs = 1000.0,
                type = EventType.CONFERENCE,
            ),
        )

    private fun hackDays(loadPersonData: LoadPersonData): List<EventForm> {
        val hackDays = mutableListOf<EventForm>()
        repeat(20) { i ->
            // Half attendance keeps a realistic hack-budget remainder, not exactly zero.
            val attendees =
                loadPersonData.data
                    .filterIndexed { personIdx, _ -> (i + personIdx) % 2 == 0 }
                    .map { it.uuid }
            hackDays.add(
                EventForm(
                    description = "Flock. Hack Day",
                    from = LocalDate.of(now.year, i % 12 + 1, (i % 2 + 1) * 14),
                    to = LocalDate.of(now.year, i % 12 + 1, (i % 2 + 1) * 14),
                    days = mutableListOf(8.0),
                    hours = 8.0,
                    personIds = attendees,
                    costs = 750.0,
                    type = EventType.FLOCK_HACK_DAY,
                ),
            )
        }
        return hackDays.toList()
    }

    private final fun EventForm.create() = service.create(this)
}
