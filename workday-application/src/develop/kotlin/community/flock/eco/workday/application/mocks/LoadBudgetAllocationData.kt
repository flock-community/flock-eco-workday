package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.budget.BudgetAllocationEntity
import community.flock.eco.workday.application.budget.DailyTimeAllocationEmbeddable
import community.flock.eco.workday.application.budget.HackTimeBudgetAllocationEntity
import community.flock.eco.workday.application.budget.HackTimeBudgetAllocationRepository
import community.flock.eco.workday.application.budget.TrainingMoneyBudgetAllocationEntity
import community.flock.eco.workday.application.budget.TrainingMoneyBudgetAllocationRepository
import community.flock.eco.workday.application.budget.TrainingTimeBudgetAllocationEntity
import community.flock.eco.workday.application.budget.TrainingTimeBudgetAllocationRepository
import community.flock.eco.workday.application.model.EventType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.domain.budget.BudgetAllocationType
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
    private val hackTimeRepo: HackTimeBudgetAllocationRepository,
    private val trainingTimeRepo: TrainingTimeBudgetAllocationRepository,
    private val trainingMoneyRepo: TrainingMoneyBudgetAllocationRepository,
    loadData: LoadData,
) {
    val data: MutableList<BudgetAllocationEntity> = mutableListOf()

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

            createHackTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(0)?.code,
                date = LocalDate.of(priorYear, 3, 14),
                description = "Hack Day - March",
                totalHours = 48.0,
                dayCount = 6,
            )
            createHackTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(1)?.code,
                date = LocalDate.of(priorYear, 6, 14),
                description = "Hack Day - June",
                totalHours = 40.0,
                dayCount = 5,
            )
            createHackTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(2)?.code,
                date = LocalDate.of(priorYear, 9, 14),
                description = "Hack Day - September",
                totalHours = 40.0,
                dayCount = 5,
            )

            createTrainingTimeAllocation(
                person = personA,
                eventCode = conferenceEvents.getOrNull(0)?.code,
                date = LocalDate.of(priorYear, 4, 10),
                description = "Kotlin Conference",
                totalHours = 80.0,
                dayCount = 10,
            )
            createTrainingMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 10, 5),
                description = "Online training - cloud architecture",
                amount = BigDecimal("1200.00"),
            )

            createTrainingMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 3, 15),
                description = "Kotlin Conference registration",
                amount = BigDecimal("2500.00"),
            )
            createTrainingMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 8, 1),
                description = "Cloud architecture course subscription",
                amount = BigDecimal("1500.00"),
            )

            createHackTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(3)?.code,
                date = LocalDate.of(currentYear, 2, 14),
                description = "Hack Day - February",
                totalHours = 40.0,
                dayCount = 5,
            )

            createTrainingMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(currentYear, 1, 20),
                description = "Team workshop - reactive programming",
                amount = BigDecimal("750.00"),
            )

            createTrainingMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(currentYear, 2, 1),
                description = "Technical book bundle",
                amount = BigDecimal("500.00"),
            )

            // --- Person B (pino): Partial, HackTime only, event-linked ---

            createHackTimeAllocation(
                person = personB,
                eventCode = hackDayEvents.getOrNull(4)?.code,
                date = LocalDate.of(currentYear, 3, 14),
                description = "Hack Day - March",
                totalHours = 16.0,
                dayCount = 2,
            )

            // --- Person C (bert, ADMIN): full coverage across all 3 budget types (primary demo user) ---

            createHackTimeAllocation(
                person = personC,
                eventCode = hackDayEvents.getOrNull(5)?.code,
                date = LocalDate.of(currentYear, 2, 14),
                description = "Hack Day - February",
                totalHours = 40.0,
                dayCount = 5,
            )
            createHackTimeAllocation(
                person = personC,
                eventCode = hackDayEvents.getOrNull(6)?.code,
                date = LocalDate.of(currentYear, 5, 14),
                description = "Hack Day - May",
                totalHours = 24.0,
                dayCount = 3,
            )

            createTrainingTimeAllocation(
                person = personC,
                eventCode = conferenceEvents.getOrNull(0)?.code,
                date = LocalDate.of(currentYear, 4, 10),
                description = "KotlinConf",
                totalHours = 40.0,
                dayCount = 5,
            )

            createTrainingMoneyAllocation(
                person = personC,
                eventCode = null,
                date = LocalDate.of(currentYear, 1, 15),
                description = "UX design workshop",
                amount = BigDecimal("750.00"),
            )
            createTrainingMoneyAllocation(
                person = personC,
                eventCode = null,
                date = LocalDate.of(currentYear, 3, 1),
                description = "O'Reilly learning subscription",
                amount = BigDecimal("499.00"),
            )
            createTrainingMoneyAllocation(
                person = personC,
                eventCode = null,
                date = LocalDate.of(currentYear, 5, 20),
                description = "Cloud certification exam",
                amount = BigDecimal("1200.00"),
            )
        }
    }

    private fun createHackTimeAllocation(
        person: Person,
        eventCode: String?,
        date: LocalDate,
        description: String,
        totalHours: Double,
        dayCount: Int,
    ) {
        val hoursPerDay = totalHours / dayCount
        val dailyAllocations =
            (0 until dayCount)
                .map { dayOffset ->
                    DailyTimeAllocationEmbeddable(
                        date = date.plusDays(dayOffset.toLong()),
                        hours = hoursPerDay,
                        type = BudgetAllocationType.HACK,
                    )
                }.toMutableList()

        hackTimeRepo
            .save(
                HackTimeBudgetAllocationEntity(
                    person = person,
                    eventCode = eventCode,
                    date = date,
                    description = description,
                    totalHours = totalHours,
                    dailyTimeAllocations = dailyAllocations,
                ),
            ).also { data.add(it) }
    }

    private fun createTrainingTimeAllocation(
        person: Person,
        eventCode: String?,
        date: LocalDate,
        description: String,
        totalHours: Double,
        dayCount: Int,
    ) {
        val hoursPerDay = totalHours / dayCount
        val dailyAllocations =
            (0 until dayCount)
                .map { dayOffset ->
                    DailyTimeAllocationEmbeddable(
                        date = date.plusDays(dayOffset.toLong()),
                        hours = hoursPerDay,
                        type = BudgetAllocationType.TRAINING,
                    )
                }.toMutableList()

        trainingTimeRepo
            .save(
                TrainingTimeBudgetAllocationEntity(
                    person = person,
                    eventCode = eventCode,
                    date = date,
                    description = description,
                    totalHours = totalHours,
                    dailyTimeAllocations = dailyAllocations,
                ),
            ).also { data.add(it) }
    }

    private fun createTrainingMoneyAllocation(
        person: Person,
        eventCode: String?,
        date: LocalDate,
        description: String,
        amount: BigDecimal,
    ) {
        trainingMoneyRepo
            .save(
                TrainingMoneyBudgetAllocationEntity(
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
