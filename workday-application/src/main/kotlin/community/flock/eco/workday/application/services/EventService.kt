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
import community.flock.eco.workday.domain.budget.BudgetAllocation
import community.flock.eco.workday.domain.budget.BudgetAllocationService
import community.flock.eco.workday.domain.budget.BudgetAllocationType
import community.flock.eco.workday.domain.budget.DailyTimeAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.HackTimeBudgetAllocationService
import community.flock.eco.workday.domain.budget.TrainingMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.TrainingMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.TrainingTimeBudgetAllocationService
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
    private val hackTimeBudgetAllocationService: HackTimeBudgetAllocationService,
    private val trainingTimeBudgetAllocationService: TrainingTimeBudgetAllocationService,
    private val trainingMoneyBudgetAllocationService: TrainingMoneyBudgetAllocationService,
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
            .forEach { budgetAllocationService.deleteById(it.id) }
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

    /**
     * Synchronise budget allocations for an event.
     * - Deletes allocations for persons no longer in the event
     * - Creates allocations for new persons
     * - Updates existing allocations when event hours/days/budget change
     * Returns the API-ready list of all current allocations for this event.
     */
    private fun syncBudgetAllocations(event: Event): List<Any> {
        val existingAllocations = budgetAllocationService.findAllByEventCode(event.code)
        val currentPersonUuids = event.persons.map { it.uuid }.toSet()

        existingAllocations
            .filter { it.person.uuid !in currentPersonUuids }
            .forEach { budgetAllocationService.deleteById(it.id) }

        val existingByPerson =
            existingAllocations
                .filter { it.person.uuid in currentPersonUuids }
                .groupBy { it.person.uuid }

        val dailyAllocations = buildDailyTimeAllocations(event)
        val totalHours = dailyAllocations.sumOf { it.hours }
        val moneyShares = splitBudgetAcrossPersons(event)

        for (appPerson in event.persons) {
            val domainPerson = appPerson.toDomain()
            val personAllocations = existingByPerson[appPerson.uuid] ?: emptyList()

            if (event.defaultTimeAllocationType != null) {
                val isHack = event.defaultTimeAllocationType in listOf("HACK", "HACK_TIME")
                val allocType = if (isHack) BudgetAllocationType.HACK else BudgetAllocationType.TRAINING
                val typedDaily = dailyAllocations.map { it.copy(type = allocType) }

                val existingTimeAllocations =
                    personAllocations.filter {
                        it is HackTimeBudgetAllocation || it is TrainingTimeBudgetAllocation
                    }
                val matchingTime =
                    existingTimeAllocations.firstOrNull {
                        (it is HackTimeBudgetAllocation) == isHack
                    }

                // Drop stale time allocations of the other subtype (e.g. after a
                // HACK <-> TRAINING switch) so the persisted row reflects the event's
                // current type instead of keeping the old sealed subtype.
                existingTimeAllocations
                    .filter { it.id != matchingTime?.id }
                    .forEach { budgetAllocationService.deleteById(it.id) }

                when (matchingTime) {
                    is HackTimeBudgetAllocation ->
                        hackTimeBudgetAllocationService.update(
                            matchingTime.id,
                            matchingTime.copy(
                                dailyTimeAllocations = typedDaily,
                                totalHours = totalHours,
                                date = event.from,
                                description = event.description,
                            ),
                        )

                    is TrainingTimeBudgetAllocation ->
                        trainingTimeBudgetAllocationService.update(
                            matchingTime.id,
                            matchingTime.copy(
                                dailyTimeAllocations = typedDaily,
                                totalHours = totalHours,
                                date = event.from,
                                description = event.description,
                            ),
                        )

                    else ->
                        if (isHack) {
                            hackTimeBudgetAllocationService.create(
                                HackTimeBudgetAllocation(
                                    person = domainPerson,
                                    eventCode = event.code,
                                    date = event.from,
                                    description = event.description,
                                    dailyTimeAllocations = typedDaily,
                                    totalHours = totalHours,
                                ),
                            )
                        } else {
                            trainingTimeBudgetAllocationService.create(
                                TrainingTimeBudgetAllocation(
                                    person = domainPerson,
                                    eventCode = event.code,
                                    date = event.from,
                                    description = event.description,
                                    dailyTimeAllocations = typedDaily,
                                    totalHours = totalHours,
                                ),
                            )
                        }
                }
            }

            val share = moneyShares[appPerson.uuid] ?: BigDecimal.ZERO
            val existingMoney = personAllocations.firstOrNull { it is TrainingMoneyBudgetAllocation }
            if (share > BigDecimal.ZERO) {
                if (existingMoney is TrainingMoneyBudgetAllocation) {
                    trainingMoneyBudgetAllocationService.update(
                        existingMoney.id,
                        existingMoney.copy(
                            amount = share,
                            date = event.from,
                            description = event.description,
                        ),
                    )
                } else {
                    trainingMoneyBudgetAllocationService.create(
                        TrainingMoneyBudgetAllocation(
                            person = domainPerson,
                            eventCode = event.code,
                            date = event.from,
                            description = event.description,
                            amount = share,
                        ),
                    )
                }
            } else if (existingMoney != null) {
                budgetAllocationService.deleteById(existingMoney.id)
            }
        }

        return budgetAllocationService.findAllByEventCode(event.code).map { alloc ->
            when (alloc) {
                is HackTimeBudgetAllocation -> alloc.produce()
                is TrainingTimeBudgetAllocation -> alloc.produce()
                is TrainingMoneyBudgetAllocation -> alloc.produce()
                else -> alloc
            }
        }
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

    private fun buildDailyTimeAllocations(event: Event): List<DailyTimeAllocation> {
        val days = event.days ?: return emptyList()
        return days
            .mapIndexed { index, hours ->
                DailyTimeAllocation(
                    date = event.from.plusDays(index.toLong()),
                    hours = hours,
                    type = BudgetAllocationType.HACK, // placeholder, overridden by caller
                )
            }.filter { it.hours > 0 }
    }
}
