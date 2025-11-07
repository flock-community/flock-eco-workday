package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.interfaces.Period
import java.time.LocalDate
import java.util.UUID

data class AssignmentForm(
    val personId: UUID,
    val clientCode: String,
    val projectCode: String? = null,
    val hourlyRate: Double,
    val hoursPerWeek: Int,
    val role: String?,
    override val from: LocalDate,
    override val to: LocalDate?,
) : Period
