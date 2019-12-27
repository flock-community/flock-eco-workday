package community.flock.eco.workday.forms

import community.flock.eco.workday.model.SickdayStatus

data class SickdayForm(
    var description: String,
    var status: SickdayStatus,


    val hours: Int,
    val personId: Long
)
