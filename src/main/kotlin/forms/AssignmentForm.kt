package community.flock.eco.workday.forms

import java.time.LocalDate

data class AssignmentForm(

    val personCode: String,
    val clientCode: String,

    val hourlyRate: Double,
    val role: String?,

    val startDate: LocalDate,
    val endDate: LocalDate?
)
