package community.flock.eco.workday.application.leaveday.service

import community.flock.eco.workday.application.common.ical.KCalendar
import community.flock.eco.workday.application.common.ical.KEvent
import community.flock.eco.workday.application.leaveday.model.LeaveDay
import java.time.Period

fun Iterable<LeaveDay>.toCalendar() = KCalendar(map { it.toCalendarEvent() })

private fun LeaveDay.toCalendarEvent() =
    KEvent(
        uid = code,
        startDate = from,
        durationInDays = durationInDays,
        summary = "Vakantie ${person.getFullName()} ($durationInDays dagen)",
    )

private val LeaveDay.durationInDays get() = Period.between(from, to).days + 1
