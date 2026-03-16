package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.budget.BudgetAllocationEntity
import community.flock.eco.workday.application.budget.DailyTimeAllocationEmbeddable
import community.flock.eco.workday.application.budget.HackTimeBudgetAllocationEntity
import community.flock.eco.workday.application.budget.HackTimeBudgetAllocationRepository
import community.flock.eco.workday.application.budget.StudyMoneyBudgetAllocationEntity
import community.flock.eco.workday.application.budget.StudyMoneyBudgetAllocationRepository
import community.flock.eco.workday.application.budget.StudyTimeBudgetAllocationEntity
import community.flock.eco.workday.application.budget.StudyTimeBudgetAllocationRepository
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
    private val studyTimeRepo: StudyTimeBudgetAllocationRepository,
    private val studyMoneyRepo: StudyMoneyBudgetAllocationRepository,
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

            // Prior year HackTime: 3 event-linked allocations (~128 hours total = 80% of 160 budget)
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

            // Prior year StudyTime: 2 allocations (~160 hours total = 80% of 200 budget)
            createStudyTimeAllocation(
                person = personA,
                eventCode = conferenceEvents.getOrNull(0)?.code,
                date = LocalDate.of(priorYear, 4, 10),
                description = "Kotlin Conference",
                totalHours = 80.0,
                dayCount = 10,
            )
            createStudyTimeAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 10, 5),
                description = "Online training - cloud architecture",
                totalHours = 80.0,
                dayCount = 10,
            )

            // Prior year StudyMoney: 2 standalone allocations (~4000 of 5000 budget = 80%)
            createStudyMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 3, 15),
                description = "Kotlin Conference registration",
                amount = BigDecimal("2500.00"),
            )
            createStudyMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(priorYear, 8, 1),
                description = "Cloud architecture course subscription",
                amount = BigDecimal("1500.00"),
            )

            // Current year HackTime: 1 event-linked allocation (~40 hours)
            createHackTimeAllocation(
                person = personA,
                eventCode = hackDayEvents.getOrNull(3)?.code,
                date = LocalDate.of(currentYear, 2, 14),
                description = "Hack Day - February",
                totalHours = 40.0,
                dayCount = 5,
            )

            // Current year StudyTime: 1 allocation (~24 hours)
            createStudyTimeAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(currentYear, 1, 20),
                description = "Team workshop - reactive programming",
                totalHours = 24.0,
                dayCount = 3,
            )

            // Current year StudyMoney: 1 standalone allocation (~500)
            createStudyMoneyAllocation(
                person = personA,
                eventCode = null,
                date = LocalDate.of(currentYear, 2, 1),
                description = "Technical book bundle",
                amount = BigDecimal("500.00"),
            )

            // --- Person B (pino): Partial, HackTime only, event-linked ---

            // Current year: 1 HackTime allocation linked to hack day event (~16 hours)
            createHackTimeAllocation(
                person = personB,
                eventCode = hackDayEvents.getOrNull(4)?.code,
                date = LocalDate.of(currentYear, 3, 14),
                description = "Hack Day - March",
                totalHours = 16.0,
                dayCount = 2,
            )

            // --- Person C (bert): Standalone StudyMoney only ---

            // Current year: 1 StudyMoney standalone allocation (~750)
            createStudyMoneyAllocation(
                person = personC,
                eventCode = null,
                date = LocalDate.of(currentYear, 1, 15),
                description = "UX design workshop",
                amount = BigDecimal("750.00"),
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
        val dailyAllocations = (0 until dayCount).map { dayOffset ->
            DailyTimeAllocationEmbeddable(
                date = date.plusDays(dayOffset.toLong()),
                hours = hoursPerDay,
                type = BudgetAllocationType.HACK,
            )
        }.toMutableList()

        hackTimeRepo.save(
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

    private fun createStudyTimeAllocation(
        person: Person,
        eventCode: String?,
        date: LocalDate,
        description: String,
        totalHours: Double,
        dayCount: Int,
    ) {
        val hoursPerDay = totalHours / dayCount
        val dailyAllocations = (0 until dayCount).map { dayOffset ->
            DailyTimeAllocationEmbeddable(
                date = date.plusDays(dayOffset.toLong()),
                hours = hoursPerDay,
                type = BudgetAllocationType.STUDY,
            )
        }.toMutableList()

        studyTimeRepo.save(
            StudyTimeBudgetAllocationEntity(
                person = person,
                eventCode = eventCode,
                date = date,
                description = description,
                totalHours = totalHours,
                dailyTimeAllocations = dailyAllocations,
            ),
        ).also { data.add(it) }
    }

    private fun createStudyMoneyAllocation(
        person: Person,
        eventCode: String?,
        date: LocalDate,
        description: String,
        amount: BigDecimal,
    ) {
        studyMoneyRepo.save(
            StudyMoneyBudgetAllocationEntity(
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
