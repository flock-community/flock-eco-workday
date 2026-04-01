package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.budget.produce
import community.flock.eco.workday.application.forms.EventForm
import community.flock.eco.workday.application.interfaces.validate
import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.application.model.Event
import community.flock.eco.workday.application.model.EventType
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
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyMoneyBudgetAllocationService
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocation
import community.flock.eco.workday.domain.budget.StudyTimeBudgetAllocationService
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
    private val studyTimeBudgetAllocationService: StudyTimeBudgetAllocationService,
    private val studyMoneyBudgetAllocationService: StudyMoneyBudgetAllocationService,
) {
    fun findAll(): Iterable<Event> = eventRepository.findAll()

    fun findAll(pageable: Pageable): Page<Event> = eventRepository.findAll(pageable)

    fun findAllByPersonUuid(personCode: UUID) =
        eventRepository
            .findAllByPersonsIsEmptyOrPersonsUuid(personCode)

    fun findByCode(code: String) = eventRepository.findByCode(code).toNullable()

    fun findAllHackDaysOf(year: Int): Iterable<EventProjection> =
        eventRepository.findAllByTypeIsAndFromBetween(
            type = EventType.FLOCK_HACK_DAY,
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
        // Delete budget allocations linked to this event
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

        // Delete allocations for persons no longer in the event
        existingAllocations
            .filter { it.person.uuid !in currentPersonUuids }
            .forEach { budgetAllocationService.deleteById(it.id) }

        val existingByPerson =
            existingAllocations
                .filter { it.person.uuid in currentPersonUuids }
                .groupBy { it.person.uuid }

        val dailyAllocations = buildDailyTimeAllocations(event)
        val totalHours = dailyAllocations.sumOf { it.hours }
        val sharePerPerson =
            if (event.budget > 0 && event.persons.isNotEmpty()) {
                BigDecimal(event.budget.toString())
                    .divide(BigDecimal(event.persons.size), 2, RoundingMode.FLOOR)
            } else {
                BigDecimal.ZERO
            }

        for (appPerson in event.persons) {
            val domainPerson = appPerson.toDomain()
            val personAllocations = existingByPerson[appPerson.uuid] ?: emptyList()

            // --- Time allocations ---
            if (event.defaultTimeAllocationType != null) {
                val isHack = event.defaultTimeAllocationType in listOf("HACK", "HACK_TIME")
                val allocType = if (isHack) BudgetAllocationType.HACK else BudgetAllocationType.STUDY
                val typedDaily = dailyAllocations.map { it.copy(type = allocType) }

                val existingTime =
                    personAllocations.firstOrNull {
                        it is HackTimeBudgetAllocation || it is StudyTimeBudgetAllocation
                    }

                if (existingTime != null) {
                    // Update existing time allocation
                    when (existingTime) {
                        is HackTimeBudgetAllocation -> {
                            hackTimeBudgetAllocationService.update(
                                existingTime.id,
                                existingTime.copy(
                                    dailyTimeAllocations = typedDaily,
                                    totalHours = totalHours,
                                    date = event.from,
                                    description = event.description,
                                ),
                            )
                        }

                        is StudyTimeBudgetAllocation -> {
                            studyTimeBudgetAllocationService.update(
                                existingTime.id,
                                existingTime.copy(
                                    dailyTimeAllocations = typedDaily,
                                    totalHours = totalHours,
                                    date = event.from,
                                    description = event.description,
                                ),
                            )
                        }

                        is StudyMoneyBudgetAllocation -> {
                            error("Cannot update money allocation for person ${appPerson.uuid}")
                        }
                    }
                } else {
                    // Create new time allocation
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
                        studyTimeBudgetAllocationService.create(
                            StudyTimeBudgetAllocation(
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

            // --- Money allocation ---
            val existingMoney = personAllocations.firstOrNull { it is StudyMoneyBudgetAllocation }
            if (sharePerPerson > BigDecimal.ZERO) {
                if (existingMoney is StudyMoneyBudgetAllocation) {
                    studyMoneyBudgetAllocationService.update(
                        existingMoney.id,
                        existingMoney.copy(
                            amount = sharePerPerson,
                            date = event.from,
                            description = event.description,
                        ),
                    )
                } else {
                    studyMoneyBudgetAllocationService.create(
                        StudyMoneyBudgetAllocation(
                            person = domainPerson,
                            eventCode = event.code,
                            date = event.from,
                            description = event.description,
                            amount = sharePerPerson,
                        ),
                    )
                }
            } else if (existingMoney != null) {
                // Budget removed — delete money allocation
                budgetAllocationService.deleteById(existingMoney.id)
            }
        }

        // Return the final state of allocations for this event
        return budgetAllocationService.findAllByEventCode(event.code).map { alloc ->
            when (alloc) {
                is HackTimeBudgetAllocation -> alloc.produce()
                is StudyTimeBudgetAllocation -> alloc.produce()
                is StudyMoneyBudgetAllocation -> alloc.produce()
                else -> alloc
            }
        }
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
