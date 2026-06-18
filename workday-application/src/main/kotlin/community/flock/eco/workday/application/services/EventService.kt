package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.budget.produce
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.interfaces.validate
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.repository.EventProjection
import community.flock.eco.workday.application.repository.EventRatingRepository
import community.flock.eco.workday.application.repository.EventRepository
import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.domain.budget.AllocationType
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocation
import community.flock.eco.workday.domain.budget.MoneyAllocationService
import community.flock.eco.workday.domain.budget.TimeAllocation
import community.flock.eco.workday.domain.budget.TimeAllocationService
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
    private val eventRatingRepository: EventRatingRepository,
    private val personService: PersonService,
    private val entityManager: EntityManager,
    private val budgetAllocationService: BudgetAllocationService,
    private val timeAllocationService: TimeAllocationService,
    private val moneyAllocationService: MoneyAllocationService,
) {
    fun findAll(): Iterable<Event> = eventRepository.findAll()

    fun findAll(pageable: Pageable): Page<Event> = eventRepository.findAll(pageable)

    fun findAllByPersonUuid(personCode: UUID) =
        eventRepository
            .findAllByPersonsIsEmptyOrPersonsUuid(personCode)

    fun findByCode(code: String) = eventRepository.findByCode(code).toNullable()

    fun findAllEventsOf(year: Int): Iterable<EventProjection> =
        eventRepository.findAllByFromBetween(
            from = LocalDate.of(year, 1, 1),
            to = LocalDate.of(year, 12, 31),
        )

    fun findAllActive(
        from: LocalDate,
        to: LocalDate,
    ): Iterable<Event> {
        val query =
            "SELECT e FROM Event e LEFT JOIN FETCH e.days WHERE e.from <= :to AND (e.to is null OR e.to >= :from)"
        return entityManager
            .createQuery(query, Event::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .resultList
            .toSet()
    }

    fun findAllActiveByPerson(
        from: LocalDate,
        to: LocalDate,
        personCode: UUID,
    ): Iterable<Event> {
        val query =
            """SELECT e
                |FROM Event e
                |LEFT JOIN FETCH e.days
                |INNER JOIN e.persons p
                |WHERE  e.from <= :to
                |AND (e.to is null OR e.to >= :from)
                |AND p.uuid = :personCode
            """.trimMargin()
        return entityManager
            .createQuery(query, Event::class.java)
            .setParameter("from", from)
            .setParameter("to", to)
            .setParameter("personCode", personCode)
            .resultList
            .toSet()
    }

    fun create(form: EventForm): Event =
        form
            .validate()
            .consume()
            .save()
            .also { it.budgetAllocations = syncBudgetAllocations(it) }

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
                    .save()
                    .also { it.budgetAllocations = syncBudgetAllocations(it) }
            }

    fun subscribeToEvent(
        eventCode: String,
        person: Person,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.run {
                Event(
                    description = description,
                    id = id,
                    code = code,
                    from = from,
                    to = to,
                    hours = hours,
                    budget = budget,
                    type = type,
                    defaultTimeAllocationType = defaultTimeAllocationType,
                    days = days,
                    persons = persons.filter { it.uuid != person.uuid }.plus(person).toMutableList(),
                ).run { eventRepository.save(this) }
                    .also { it.budgetAllocations = syncBudgetAllocations(it) }
            } ?: error("Cannot subscribe to Event: $eventCode")

    fun unsubscribeFromEvent(
        eventCode: String,
        person: Person,
    ): Event =
        eventRepository
            .findByCode(eventCode)
            .toNullable()
            ?.run {
                Event(
                    description = description,
                    id = id,
                    code = code,
                    from = from,
                    to = to,
                    hours = hours,
                    budget = budget,
                    type = type,
                    defaultTimeAllocationType = defaultTimeAllocationType,
                    days = days,
                    persons = persons.filter { it.uuid != person.uuid }.toMutableList(),
                ).run { eventRepository.save(this) }
                    .also { it.budgetAllocations = syncBudgetAllocations(it) }
            } ?: error("Cannot unsubscribe from Event: $eventCode")

    @Transactional
    fun deleteByCode(code: String) {
        budgetAllocationService
            .findAllByEventCode(code)
            .forEach { budgetAllocationService.deleteByCode(it.code) }
        eventRatingRepository.deleteByEventCode(code)
        eventRepository.deleteByCode(code)
    }

    private fun Event.save() = eventRepository.save(this)

    private fun EventForm.consume(it: Event? = null): Event {
        val persons =
            personService
                .findByPersonCodeIdIn(personIds)

        return Event(
            id = it?.id ?: 0L,
            code = it?.code ?: UUID.randomUUID().toString(),
            description = description,
            from = from,
            to = to,
            persons = persons.toMutableList(),
            hours = hours,
            days = days.toMutableList(),
            budget = budget,
            type = type,
            defaultTimeAllocationType = defaultTimeAllocationType,
        )
    }

    // Resets every participant to the event default; per-person time deviations are re-applied
    // afterwards by the dialog, since this overwrites them.
    private fun syncBudgetAllocations(event: Event): List<Any> {
        val existingAllocations = budgetAllocationService.findAllByEventCode(event.code)
        val currentPersonUuids = event.persons.map { it.uuid }.toSet()

        existingAllocations
            .filter { it.person.uuid !in currentPersonUuids }
            .forEach { budgetAllocationService.deleteByCode(it.code) }

        val existingByPerson =
            existingAllocations
                .filter { it.person.uuid in currentPersonUuids }
                .groupBy { it.person.uuid }

        val allocType = event.defaultTimeAllocationType?.let(::parseAllocationType)
        val dailyAllocations = buildDailyTimeAllocations(event, allocType)
        val moneyShares = splitBudgetAcrossPersons(event)

        for (appPerson in event.persons) {
            val domainPerson = appPerson.toDomain()
            val personAllocations = existingByPerson[appPerson.uuid] ?: emptyList()

            val existingTime = personAllocations.filterIsInstance<TimeAllocation>().firstOrNull()
            if (dailyAllocations.isNotEmpty()) {
                if (existingTime != null) {
                    timeAllocationService.update(
                        existingTime.code,
                        existingTime.copy(
                            dailyAllocations = dailyAllocations,
                            date = event.from,
                            description = event.description,
                        ),
                    )
                } else {
                    timeAllocationService.create(
                        TimeAllocation(
                            person = domainPerson,
                            eventCode = event.code,
                            date = event.from,
                            description = event.description,
                            dailyAllocations = dailyAllocations,
                        ),
                    )
                }
            } else if (existingTime != null) {
                budgetAllocationService.deleteByCode(existingTime.code)
            }

            val share = moneyShares[appPerson.uuid] ?: BigDecimal.ZERO
            val existingMoney = personAllocations.filterIsInstance<MoneyAllocation>().firstOrNull()
            if (share > BigDecimal.ZERO) {
                if (existingMoney != null) {
                    moneyAllocationService.update(
                        existingMoney.code,
                        existingMoney.copy(
                            amount = share,
                            date = event.from,
                            description = event.description,
                        ),
                    )
                } else {
                    moneyAllocationService.create(
                        MoneyAllocation(
                            person = domainPerson,
                            eventCode = event.code,
                            date = event.from,
                            description = event.description,
                            amount = share,
                        ),
                    )
                }
            } else if (existingMoney != null) {
                budgetAllocationService.deleteByCode(existingMoney.code)
            }
        }

        return budgetAllocationService.findAllByEventCode(event.code).map { it.produce() }
    }

    /**
     * Split the event budget evenly across participants. Cents that don't divide
     * evenly are handed out one at a time to the first participants so the shares
     * still add up to the full budget instead of dropping the rounding remainder.
     */
    private fun splitBudgetAcrossPersons(event: Event): Map<UUID, BigDecimal> {
        if (event.budget <= 0 || event.persons.isEmpty()) return emptyMap()
        val total = BigDecimal(event.budget.toString()).setScale(2, RoundingMode.HALF_UP)
        val count = event.persons.size
        val base = total.divide(BigDecimal(count), 2, RoundingMode.FLOOR)
        val leftoverCents = total.subtract(base.multiply(BigDecimal(count))).movePointRight(2).toInt()
        val cent = BigDecimal("0.01")
        return event.persons
            .mapIndexed { index, person ->
                person.uuid to if (index < leftoverCents) base + cent else base
            }.toMap()
    }

    private fun buildDailyTimeAllocations(
        event: Event,
        type: AllocationType?,
    ): List<DailyTimeAllocation> {
        if (type == null) return emptyList()
        val days = event.days ?: return emptyList()
        return days
            .mapIndexed { index, hours ->
                DailyTimeAllocation(
                    date = event.from.plusDays(index.toLong()),
                    hours = hours,
                    type = type,
                )
            }.filter { it.hours > 0 }
    }

    private fun parseAllocationType(value: String): AllocationType? =
        when (value) {
            "HACK", "HACK_TIME" -> AllocationType.HACK
            "TRAINING", "TRAINING_TIME" -> AllocationType.TRAINING
            else -> null
        }
}
