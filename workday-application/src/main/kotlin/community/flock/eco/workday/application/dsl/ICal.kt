package community.flock.eco.workday.application.dsl

import biweekly.ICalendar
import biweekly.component.VEvent
import biweekly.component.VTimezone
import biweekly.io.TimezoneAssignment
import biweekly.io.TimezoneInfo
import biweekly.util.Duration
import community.flock.eco.workday.application.model.LeaveDay
import java.time.LocalDate
import java.time.Period
import java.time.ZoneId
import java.util.Date
import java.util.TimeZone

private const val TIMEZONE_ID = "Europe/Amsterdam"

data class KCalendar(
    val events: List<KEvent>,
) {
    fun serialize(): String =
        ICalendar()
            .apply {
                setName("Flock. Holidays")
                timezoneInfo = defaultTimezoneInfo
            }
            .also { iCalendar ->
                events
                    .map { it.serialize() }
                    .forEach { iCalendar.addEvent(it) }
            }
            .write()

    companion object {
        val defaultTimezoneInfo =
            TimezoneInfo().apply {
                defaultTimezone =
                    TimezoneAssignment(
                        TimeZone.getTimeZone(ZoneId.of(TIMEZONE_ID)),
                        VTimezone(TIMEZONE_ID),
                    )
            }
    }
}

data class KEvent(
    val uid: String?,
    val summary: String?,
    val startDate: LocalDate?,
    val durationInDays: Int?,
) {
    fun serialize(): VEvent =
        VEvent()
            .apply {
                setUid(this@KEvent.uid)
                setSummary(this@KEvent.summary)
                setDateStart(this@KEvent.startDate?.toDate())
                setDuration(Duration.builder().days(this@KEvent.durationInDays).build())
            }
}

fun Iterable<LeaveDay>.toCalendar() = KCalendar(map { it.toCalendarEvent() })

private fun LeaveDay.toCalendarEvent() =
    KEvent(
        uid = code,
        startDate = from,
        durationInDays = durationInDays,
        summary = "Vakantie ${person.getFullName()} ($durationInDays dagen)",
    )

private val LeaveDay.durationInDays get() = Period.between(from, to).days + 1

private fun LocalDate.toDate() =
    atStartOfDay(ZoneId.of(TIMEZONE_ID))
        .toInstant()
        .let { Date.from(it) }
