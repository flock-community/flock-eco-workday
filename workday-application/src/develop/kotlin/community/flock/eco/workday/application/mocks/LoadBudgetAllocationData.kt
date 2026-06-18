package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.budget.DailyTimeAllocationEmbeddable
import community.flock.eco.workday.application.budget.MoneyAllocationEntity
import community.flock.eco.workday.application.budget.MoneyAllocationRepository
import community.flock.eco.workday.application.budget.TimeAllocationEntity
import community.flock.eco.workday.application.budget.TimeAllocationRepository
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.AllocationType
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.math.BigDecimal
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadBudgetAllocationData(
    private val loadPersonData: LoadPersonData,
    private val loadEventData: LoadEventData,
    private val loadContractData: LoadContractData,
    private val timeRepo: TimeAllocationRepository,
    private val moneyRepo: MoneyAllocationRepository,
    loadData: LoadData,
) {
    val data: MutableList<Any> = mutableListOf()

    private val now: LocalDate = LocalDate.now().withDayOfMonth(1)
    private val currentYear = now.year
    private val priorYear = currentYear - 1

    init {
        loadData.load {
            val personA = loadPersonData.findPersonByUserEmail("ieniemienie@sesam.straat")
            val personB = loadPersonData.findPersonByUserEmail("pino@sesam.straat")
            val personC = loadPersonData.findPersonByUserEmail("bert@sesam.straat")

            val hackDayEvents = loadEventData.data.filter { it.type == EventType.FLOCK_HACK_DAY }
            val conferenceEvents = loadEventData.data.filter { it.type == EventType.CONFERENCE }

            // --- Person A (ieniemienie): Full coverage, all 3 types, 2 years ---

            createTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(0)?.code,
                date = LocalDate.of(priorYear, 3, 14),
                description = "Hack Day - March",
                totalHours = 48.0,
                dayCount = 6,
                type = AllocationType.HACK,
            )
            createTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(1)?.code,
                date = LocalDate.of(priorYear, 6, 14),
                description = "Hack Day - June",
                totalHours = 40.0,
                dayCount = 5,
                type = AllocationType.HACK,
            )
            createTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(2)?.code,
                date = LocalDate.of(priorYear, 9, 14),
                description = "Hack Day - September",
                totalHours = 40.0,
                dayCount = 5,
                type = AllocationType.HACK,
            )

            createTimeAllocation(
                person = personA,
                eventCode = conferenceEvents.getOrNull(0)?.code,
                date = LocalDate.of(priorYear, 4, 10),
                description = "Kotlin Conference",
                totalHours = 80.0,
                dayCount = 10,
                type = AllocationType.TRAINING,
            )
            createMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 10, 5),
                description = "Online training - cloud architecture",
                amount = BigDecimal("1200.00"),
            )

            createMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 3, 15),
                description = "Kotlin Conference registration",
                amount = BigDecimal("2500.00"),
            )
            createMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 8, 1),
                description = "Cloud architecture course subscription",
                amount = BigDecimal("1500.00"),
            )

            createTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(3)?.code,
                date = LocalDate.of(currentYear, 2, 14),
                description = "Hack Day - February",
                totalHours = 40.0,
                dayCount = 5,
                type = AllocationType.HACK,
            )

            createMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(currentYear, 1, 20),
                description = "Team workshop - reactive programming",
                amount = BigDecimal("750.00"),
            )

            createMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(currentYear, 2, 1),
                description = "Technical book bundle",
                amount = BigDecimal("500.00"),
            )

            // --- Person B (pino): Partial, hack time only, event-linked ---

            createTimeAllocation(
                person = personB,
                eventCode = hackDayEvents.getOrNull(4)?.code,
                date = LocalDate.of(currentYear, 3, 14),
                description = "Hack Day - March",
                totalHours = 16.0,
                dayCount = 2,
                type = AllocationType.HACK,
            )

            // --- Person C (bert, ADMIN): full coverage across all budget types (primary demo user) ---

            createTimeAllocation(
                person = personC,
                eventCode = hackDayEvents.getOrNull(5)?.code,
                date = LocalDate.of(currentYear, 2, 14),
                description = "Hack Day - February",
                totalHours = 40.0,
                dayCount = 5,
                type = AllocationType.HACK,
            )
            createTimeAllocation(
                person = personC,
                eventCode = hackDayEvents.getOrNull(6)?.code,
                date = LocalDate.of(currentYear, 5, 14),
                description = "Hack Day - May",
                totalHours = 24.0,
                dayCount = 3,
                type = AllocationType.HACK,
            )

            createTimeAllocation(
                person = personC,
                eventCode = conferenceEvents.getOrNull(0)?.code,
                date = LocalDate.of(currentYear, 4, 10),
                description = "KotlinConf",
                totalHours = 40.0,
                dayCount = 5,
                type = AllocationType.TRAINING,
            )

            createMoneyAllocation(
                person = personC,
                eventCode = null,
                date = LocalDate.of(currentYear, 1, 15),
                description = "UX design workshop",
                amount = BigDecimal("750.00"),
            )
            createMoneyAllocation(
                person = personC,
                eventCode = null,
                date = LocalDate.of(currentYear, 3, 1),
                description = "O'Reilly learning subscription",
                amount = BigDecimal("499.00"),
            )
            createMoneyAllocation(
                person = personC,
                eventCode = null,
                date = LocalDate.of(currentYear, 5, 20),
                description = "Cloud certification exam",
                amount = BigDecimal("1200.00"),
            )
        }
    }

    private fun createTimeAllocation(
        person: Person,
        eventCode: String?,
        date: LocalDate,
        description: String,
        totalHours: Double,
        dayCount: Int,
        type: AllocationType,
    ) {
        val hoursPerDay = totalHours / dayCount
        val dailyAllocations =
            (0 until dayCount)
                .map { dayOffset ->
                    DailyTimeAllocationEmbeddable(
                        date = date.plusDays(dayOffset.toLong()),
                        hours = hoursPerDay,
                        type = type,
                    )
                }.toMutableList()

        timeRepo
            .save(
                TimeAllocationEntity(
                    person = person,
                    eventCode = eventCode,
                    date = date,
                    description = description,
                    dailyAllocations = dailyAllocations,
                ),
            ).also { data.add(it) }
    }

    private fun createMoneyAllocation(
        person: Person,
        eventCode: String?,
        date: LocalDate,
        description: String,
        amount: BigDecimal,
    ) {
        moneyRepo
            .save(
                MoneyAllocationEntity(
                    person = person,
                    eventCode = eventCode,
                    date = date,
                    description = description,
                    amount = amount,
                    files = mutableListOf(),
                ),
            ).also { data.add(it) }
    }
}
