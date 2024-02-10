package community.flock.eco.workday.utils

import community.flock.eco.workday.model.WorkDay
import java.time.LocalDate
import java.time.temporal.WeekFields

data class WorkWeekDay(val date: LocalDate, val value: Double)

fun WorkDay.toWorkWeeks(): Map<Int, List<WorkWeekDay>> {
    val workWeeks = mutableMapOf<Int, MutableList<WorkWeekDay>>()
    if (days != null) {
        var currentDay = from
        var index = 0
        while (!currentDay.isAfter(to)) {
            val workWeek = workWeeks.getOrPut(getWeekNumber(currentDay)) { mutableListOf() }
            workWeek.add(WorkWeekDay(currentDay, days[index++]))
            currentDay = currentDay.plusDays(1)
        }
    }
    return workWeeks
}

private fun getWeekNumber(date: LocalDate): Int = date.get(WeekFields.ISO.weekOfYear())
