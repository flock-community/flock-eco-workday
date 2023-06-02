package community.flock.eco.workday.dsl

import biweekly.ICalendar
import biweekly.component.VEvent
import biweekly.util.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.Date

fun calendar(f: KCalendar.() -> Unit) =
    KCalendar().apply(f).delegate

class KCalendar {
    internal val delegate = ICalendar()

    fun event(f: KEvent.() -> Unit) {
        KEvent()
            .apply(f)
            .delegate
            .let {
                delegate.addEvent(it)
            }
    }
}

class KEvent {
    internal val delegate = VEvent()

    var uuid: String?
        get() = delegate.uid?.value
        set(value) = delegate.setUid(value).discard()

    var summary: String?
        get() = delegate.summary?.value
        set(value) = delegate.setSummary(value).discard()

    var startDate: LocalDate?
        get() = delegate.dateStart?.value?.toInstant()?.toLocalDateTime()
        set(value) = delegate.setDateStart(value?.toDate(), false).discard()

    var durationInDays: Int?
        get() = delegate.duration?.value?.days
        set(value) = delegate.setDuration(Duration.builder().days(value).build()).discard()
}

private fun Any.discard() = Unit

private fun LocalDate.toDate() =
    atStartOfDay(ZoneId.systemDefault()).toInstant()
        .let { Date.from(it) }

private fun Instant.toLocalDateTime() =
    LocalDate.ofInstant(this, ZoneId.systemDefault())
