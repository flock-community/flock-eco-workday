package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.EventDayInput
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.interfaces.validate
import community.flock.eco.workday.application.model.BudgetCategory
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventDay
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventDayRepository
import community.flock.eco.workday.application.repository.EventRatingRepository
import community.flock.eco.workday.application.repository.EventRepository
import community.flock.eco.workday.core.utils.toNullable
import jakarta.persistence.EntityManager
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.util.UUID

@Service
@Transactional
class EventService(
    private val eventRepository: EventRepository,
    private val eventDayRepository: EventDayRepository,
    private val eventRatingRepository: EventRatingRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager,
) {
    fun findAll(): Iterable<Event> = eventRepository.findAll()

    fun findAll(pageable: Pageable): Page<Event> = eventRepository.findAll(pageable)

    fun findByCode(code: String) = eventRepository.findByCode(code).toNullable()

    fun findAllEventsOf(year: Int): Iterable<Event> =
        eventRepository.findAllByFromBetween(
            from = LocalDate.of(year, 1, 1),
            to = LocalDate.of(year, 12, 31),
        )

    fun findAllByYear(
        year: Int,
        pageable: Pageable,
    ): Page<Event> =
        eventRepository.findAllByFromBetween(
            from = LocalDate.of(year, 1, 1),
            to = LocalDate.of(year, 12, 31),
            pageable = pageable,
        )

    fun create(form: EventForm): Event =
        form
            .validate()
            .consume()

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
            }

    fun subscribeToEvent(
        eventCode: String,
        person: Person,
        hours: Double? = null,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.also { event ->
                val existing = event.eventDays.firstOrNull { it.person.uuid == person.uuid }
                when {
                    existing == null -> {
                        eventDayRepository.save(event.eventDayFor(person, hours = hours ?: event.hours))
                        event.rebalanceCosts()
                    }
                    hours != null && hours != existing.hours -> existing.hours = hours
                }
            }?.refreshed()
            ?: error("Cannot subscribe to Event: $eventCode")

    fun unsubscribeFromEvent(
        eventCode: String,
        person: Person,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.also { event ->
                eventDayRepository.deleteByEventCodeAndPersonUuid(eventCode, person.uuid)
                event.rebalanceCosts()
            }?.refreshed()
            ?: error("Cannot unsubscribe from Event: $eventCode")

    @Transactional
    fun deleteByCode(code: String) {
        eventRatingRepository.deleteByEventCode(code)
        eventDayRepository.deleteByEventCode(code)
        eventRepository.deleteByCode(code)
    }

    private fun EventForm.consume(existing: Event? = null): Event {
        val previousHours = existing?.hours
        val event =
            eventRepository.save(
                Event(
                    id = existing?.id ?: 0L,
                    code = existing?.code ?: UUID.randomUUID().toString(),
                    description = description,
                    from = from,
                    to = to,
                    hours = hours,
                    days = days.toMutableList(),
                    costs = costs,
                    type = type,
                ),
            )
        if (participants.isNotEmpty()) {
            event.rebuildEventDaysFromParticipants(participants)
        } else {
            val persons = personService.findByPersonCodeIdIn(personIds).toList()
            event.rebuildEventDaysFromTemplate(persons, previousHours)
        }
        return event.refreshed()
    }

    // Cost shares arrive already balanced from the admin modal; persist verbatim (cents only).
    // A person may appear once per budget category; HACK rows are hours-only, so money is dropped.
    private fun Event.rebuildEventDaysFromParticipants(participants: List<EventDayInput>) {
        eventDayRepository.deleteAll(eventDayRepository.findAllByEventCode(code))
        val personsById =
            personService
                .findByPersonCodeIdIn(participants.map { it.personId }.distinct())
                .associateBy { it.uuid }
        participants.forEach { participant ->
            val person = personsById[participant.personId] ?: return@forEach
            val category = participant.budgetCategory ?: budgetCategory
            val cost = if (category == BudgetCategory.HACK) null else participant.cost?.setScale(2, RoundingMode.HALF_UP)
            eventDayRepository.save(
                eventDayFor(
                    person = person,
                    cost = cost,
                    hours = participant.hours,
                    days = participant.days?.toMutableList() ?: days?.toMutableList(),
                    budgetCategory = participant.budgetCategory,
                ),
            )
        }
    }

    // Override detected by hours diverging from the previous default, not by membership: the
    // dialog round-trips every attendee into personIds, so a self-subscriber is otherwise
    // indistinguishable from an admin-added participant.
    private fun Event.rebuildEventDaysFromTemplate(
        persons: List<Person>,
        previousDefaultHours: Double?,
    ) {
        val existing = eventDayRepository.findAllByEventCode(code)
        val overriddenHours =
            existing
                .filter { previousDefaultHours != null && it.hours != previousDefaultHours }
                .associate { it.person.uuid to it.hours }
        eventDayRepository.deleteAll(existing)
        val costShares = splitEvenly(costs.toBigDecimal(), persons.size)
        persons.forEachIndexed { index, person ->
            eventDayRepository.save(
                eventDayFor(person, costShares[index], hours = overriddenHours[person.uuid] ?: hours),
            )
        }
    }

    // Money lands only on non-HACK rows: HACK is hours-only (no hack money budget), so its
    // cost stays null and the event total splits across the remaining rows.
    private fun Event.rebalanceCosts() {
        val days = eventDayRepository.findAllByEventCode(code)
        val (hackDays, moneyDays) = days.partition { (it.budgetCategory ?: budgetCategory) == BudgetCategory.HACK }
        hackDays.forEach { it.cost = null }
        val total = costs.toBigDecimal()
        if (total.signum() == 0 || moneyDays.isEmpty()) return
        val costShares = splitEvenly(total, moneyDays.size)
        moneyDays.forEachIndexed { index, day -> day.cost = costShares[index] }
    }

    private fun Event.eventDayFor(
        person: Person,
        cost: BigDecimal? = null,
        hours: Double = this.hours,
        days: MutableList<Double>? = this.days?.toMutableList(),
        budgetCategory: BudgetCategory? = null,
    ) = EventDay(
        from = from,
        to = to,
        hours = hours,
        days = days,
        cost = cost,
        budgetCategory = budgetCategory,
        person = person,
        event = this,
    )

    private fun splitEvenly(
        total: BigDecimal,
        count: Int,
    ): List<BigDecimal> {
        if (count <= 0) return emptyList()
        val cents = total.movePointRight(2).setScale(0, RoundingMode.HALF_UP).toLong()
        val base = cents / count
        val remainder = (cents % count).toInt()
        return (0 until count).map { index ->
            BigDecimal.valueOf(base + if (index < remainder) 1L else 0L, 2)
        }
    }

    private fun Event.refreshed(): Event =
        also {
            entityManager.flush()
            entityManager.refresh(it)
        }
}
