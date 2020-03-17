package community.flock.eco.workday.forms

import community.flock.eco.workday.interfaces.Period
import java.time.LocalDate

data class AssignmentForm(

    val personCode: String,
    val clientCode: String,

    val hourlyRate: Double,
    val hoursPerWeek: Int,

    val role: String?,

    override val from: LocalDate,
    override val to: LocalDate?
) : Period
