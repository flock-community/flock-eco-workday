package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.forms.SickDayForm
import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.forms.WorkDaySheetForm
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.SickDayService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.application.utils.DateUtils.isWorkingDay
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

/**
 * Paints a realistic timeline for every person in [UsersWithDefinedHours].
 *
 * The Hours overview chart demo needs at least one user whose bars are fully
 * accounted for and visibly use multiple categories. For each of those users,
 * this seeder back-fills the last six months with a mix of:
 *
 * - **Worked hours** — every working day that isn't otherwise assigned.
 * - **Paid leave** — two days per month (around day 8 and day 22).
 * - **Holiday** — a five-day block in the 3rd month of the window.
 * - **Sick** — a single day in the 2nd month of the window.
 * - **Events** — provided by `LoadEventData` (king's day, community days,
 *   hack days every ~2 weeks); subtracted from the worked-hour fill so the
 *   user isn't double-booked.
 *
 * The randomized seeders ([LoadLeaveDayData], [LoadSickdaysData],
 * [LoadWorkDayData]) skip these users entirely so this class is the sole
 * source of truth for their hour log.
 */
@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadRealisticHoursData(
    private val workDayService: WorkDayService,
    private val leaveDayService: LeaveDayService,
    private val sickDayService: SickDayService,
    loadData: LoadData,
    loadAssignmentData: LoadAssignmentData,
    loadEventData: LoadEventData,
    usersWithDefinedHours: UsersWithDefinedHours,
) {
    init {
        loadData.load {
            val lastMonth = LocalDate.now().withDayOfMonth(1)
            val months =
                (0L..5L)
                    .map { lastMonth.minusMonths(5 - it) }

            usersWithDefinedHours.persons.forEach { person ->
                val assignment =
                    loadAssignmentData.data.first { it.person?.uuid == person.uuid }
                val eventDays =
                    loadEventData.data
                        .asSequence()
                        .filter { event ->
                            event.persons.isEmpty() || event.persons.any { it.uuid == person.uuid }
                        }.flatMap { it.from.workingDaysTo(it.to) }
                        .toSet()

                val claimedDays = mutableSetOf<LocalDate>().apply { addAll(eventDays) }

                months.forEachIndexed { idx, monthStart ->
                    val monthEnd = monthStart.plusMonths(1).minusDays(1)
                    val workingDays = monthStart.workingDaysTo(monthEnd).toList()

                    claimedDays += paintPaidLeave(workingDays, claimedDays, person)
                    if (idx == 1) claimedDays += paintSickDay(workingDays, claimedDays, person)
                    if (idx == 2) claimedDays += paintHoliday(workingDays, claimedDays, person)
                    paintWorkedHours(workingDays - claimedDays, assignment.code)
                }
            }
        }
    }

    private fun paintPaidLeave(
        workingDays: List<LocalDate>,
        claimed: Set<LocalDate>,
        person: Person,
    ): Set<LocalDate> {
        val available = workingDays.filter { it !in claimed }
        val picks =
            listOf(8, 22)
                .mapNotNull { target -> available.firstOrNull { it.dayOfMonth >= target } }
                .distinct()
                .toSet()
        picks.forEach {
            leaveDayService.create(
                LeaveDayForm(
                    type = LeaveDayType.PAID_LEAVE,
                    description = "Doctor's appointment",
                    from = it,
                    to = it,
                    days = mutableListOf(8.0),
                    hours = 8.0,
                    personId = person.uuid,
                ),
            )
        }
        return picks
    }

    private fun paintSickDay(
        workingDays: List<LocalDate>,
        claimed: Set<LocalDate>,
        person: Person,
    ): Set<LocalDate> {
        val day = workingDays.firstOrNull { it !in claimed && it.dayOfMonth >= 10 } ?: return emptySet()
        sickDayService.create(
            SickDayForm(
                description = "Flu",
                from = day,
                to = day,
                days = mutableListOf(8.0),
                hours = 8.0,
                personId = person.uuid,
            ),
        )
        return setOf(day)
    }

    private fun paintHoliday(
        workingDays: List<LocalDate>,
        claimed: Set<LocalDate>,
        person: Person,
    ): Set<LocalDate> {
        val block =
            workingDays
                .asSequence()
                .windowed(5)
                .firstOrNull { window ->
                    window.none { it in claimed } &&
                        window.first().daysTo(window.last()).count() == window.size
                }?.toList() ?: return emptySet()
        leaveDayService.create(
            LeaveDayForm(
                type = LeaveDayType.HOLIDAY,
                description = "Spring holiday",
                from = block.first(),
                to = block.last(),
                days = MutableList(5) { 8.0 },
                hours = 40.0,
                personId = person.uuid,
            ),
        )
        return block.toSet()
    }

    private fun paintWorkedHours(days: List<LocalDate>, assignmentCode: String) {
        if (days.isEmpty()) return
        workDayService.create(
            WorkDayForm(
                from = days.first(),
                to = days.last(),
                hours = days.size * 8.0,
                days =
                    days
                        .first()
                        .daysTo(days.last())
                        .map { if (it in days) 8.0 else 0.0 }
                        .toMutableList(),
                assignmentCode = assignmentCode,
                sheets =
                    listOf(
                        WorkDaySheetForm(
                            name = "timesheet.pdf",
                            file = UUID.randomUUID(),
                        ),
                    ),
            ),
        )
    }

    private fun LocalDate.daysTo(other: LocalDate): Sequence<LocalDate> =
        generateSequence(this) { it.plusDays(1) }.takeWhile { !it.isAfter(other) }

    private fun LocalDate.workingDaysTo(other: LocalDate): Sequence<LocalDate> =
        daysTo(other).filter { it.isWorkingDay() }
}
