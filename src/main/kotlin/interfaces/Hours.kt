package community.flock.eco.workday.interfaces

import community.flock.eco.workday.forms.EventForm
import java.time.temporal.ChronoUnit

interface Hours {
    val hours: Int
    val days: List<Int>?
}

