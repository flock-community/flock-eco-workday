package community.flock.eco.workday.dsl

import biweekly.ICalendar
import biweekly.component.VEvent
import biweekly.util.Duration
import community.flock.eco.workday.model.HoliDay
import java.time.Instant
import java.time.LocalDate
import java.time.Period
import java.time.ZoneId
import java.util.Date

data class KCalendar(
    val events: List<KEvent>
) {
    fun serialize(): String = ICalendar()
        .apply {
            this@KCalendar.events
                .map { it.serialize() }
                .forEach { addEvent(it) }
        }.write()
}

data class KEvent(
    val uid: String?,
    val summary: String?,
    val startDate: LocalDate?,
    val durationInDays: Int?
) {
    fun serialize(): VEvent = VEvent()
        .apply {
            setUid(this@KEvent.uid)
            setSummary(this@KEvent.summary)
            setDateStart(this@KEvent.startDate?.toDate())
            setDuration(Duration.builder().days(this@KEvent.durationInDays).build())
        }
}

fun Iterable<HoliDay>.toCalendar() =
    KCalendar(map { it.toCalendarEvent() })

private fun HoliDay.toCalendarEvent() = KEvent(
    uid = code,
    startDate = from,
    durationInDays = durationInDays,
    summary = "Vakantie ${person.getFullName()} (${durationInDays} dagen)"
)

private val HoliDay.durationInDays get() = Period.between(from, to).days + 1

private fun LocalDate.toDate() =
    atStartOfDay(ZoneId.systemDefault()).toInstant()
        .let { Date.from(it) }

private fun Instant.toLocalDateTime() =
    LocalDate.ofInstant(this, ZoneId.systemDefault())
