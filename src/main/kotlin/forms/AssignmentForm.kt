package community.flock.eco.workday.forms

import community.flock.eco.workday.interfaces.Period
import java.time.LocalDate
import java.util.*

data class AssignmentForm(

    val personId: UUID,
    val clientCode: String,

    val hourlyRate: Double,
    val hoursPerWeek: Int,

    val role: String?,

    override val from: LocalDate,
    override val to: LocalDate?
) : Period
