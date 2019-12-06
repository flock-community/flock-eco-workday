package community.flock.eco.workday.forms

import community.flock.eco.workday.model.SickdayStatus

data class SickdayForm(
    val description: String,
    val status: SickdayStatus? = null,

    val hours: Int,
    val personId: Long
)
