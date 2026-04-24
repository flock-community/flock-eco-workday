package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.forms.LeaveDayForm
import community.flock.eco.workday.application.forms.WorkDayForm
import community.flock.eco.workday.application.forms.WorkDaySheetForm
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.services.LeaveDayService
import community.flock.eco.workday.application.services.WorkDayService
import community.flock.eco.workday.application.utils.DateUtils.isWorkingDay
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.util.UUID

/**
 * Paints a realistic timeline on top of the baseline seeds so the "Hours overview"
 * chart has at least one user whose bars are fully accounted for with a mix of
 * worked hours, paid leave, and events.
 *
 * Tommy gets: every working day of the last 6 months filled with 8h of worked
 * hours, one paid-leave day every ~3 weeks, minus any day that already has a
 * baseline event (king's day, hack days, community days) so we don't double-book.
 */
@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
@Order(200)
class LoadRealisticHoursData(
    private val workDayService: WorkDayService,
    private val leaveDayService: LeaveDayService,
    loadData: LoadData,
    loadAssignmentData: LoadAssignmentData,
    loadPersonData: LoadPersonData,
    loadEventData: LoadEventData,
) {
    init {
        loadData.load {
            val tommy =
                loadPersonData.findPersonByUserEmail("tommy@sesam.straat")
            val tommyAssignment =
                loadAssignmentData.data.first { it.person?.uuid == tommy.uuid }

            val today = LocalDate.now()
            val firstMonth = today.withDayOfMonth(1).minusMonths(5)
            val lastMonth = today.withDayOfMonth(1)

            val busyDays: Set<LocalDate> =
                loadEventData.data
                    .asSequence()
                    .filter { event ->
                        event.persons.isEmpty() ||
                            event.persons.any { p -> p.uuid == tommy.uuid }
                    }.flatMap { (it.from..it.to).workingDays() }
                    .toSet()

            val paidLeaveDays: MutableSet<LocalDate> = mutableSetOf()

            generateSequence(firstMonth) { it.plusMonths(1) }
                .takeWhile { !it.isAfter(lastMonth) }
                .forEach { monthStart ->
                    val monthEnd = monthStart.plusMonths(1).minusDays(1)
                    val workingDaysThisMonth =
                        (monthStart..monthEnd).workingDays().toList()

                    // Pick two paid-leave days per month: days 8 and 22 when available.
                    listOf(8, 22)
                        .map { dom ->
                            workingDaysThisMonth.firstOrNull {
                                it.dayOfMonth >= dom && it !in busyDays
                            }
                        }.filterNotNull()
                        .forEach { date ->
                            paidLeaveDays += date
                            leaveDayService.create(
                                LeaveDayForm(
                                    type = LeaveDayType.PAID_LEAVE,
                                    description = "Doctor's appointment",
                                    from = date,
                                    to = date,
                                    days = mutableListOf(8.0),
                                    hours = 8.0,
                                    personId = tommy.uuid,
                                ),
                            )
                        }
                }

            // Fill every remaining working day of the window with 8h of worked hours.
            generateSequence(firstMonth) { it.plusMonths(1) }
                .takeWhile { !it.isAfter(lastMonth) }
                .forEach { monthStart ->
                    val monthEnd = monthStart.plusMonths(1).minusDays(1)
                    val daysInMonth =
                        (monthStart..monthEnd)
                            .workingDays()
                            .filter { it !in busyDays && it !in paidLeaveDays }
                            .toList()
                    if (daysInMonth.isEmpty()) return@forEach

                    workDayService.create(
                        WorkDayForm(
                            from = daysInMonth.first(),
                            to = daysInMonth.last(),
                            hours = daysInMonth.size * 8.0,
                            days =
                                (daysInMonth.first()..daysInMonth.last())
                                    .dateRange()
                                    .map { if (it in daysInMonth) 8.0 else 0.0 }
                                    .toMutableList(),
                            assignmentCode = tommyAssignment.code,
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
        }
    }

    private operator fun LocalDate.rangeTo(other: LocalDate) =
        DateRange(this, other)

    private data class DateRange(
        val start: LocalDate,
        val endInclusive: LocalDate,
    ) {
        fun dateRange(): Sequence<LocalDate> =
            generateSequence(start) { it.plusDays(1) }
                .takeWhile { !it.isAfter(endInclusive) }

        fun workingDays(): Sequence<LocalDate> =
            dateRange().filter { it.isWorkingDay() }
    }
}
