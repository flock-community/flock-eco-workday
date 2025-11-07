package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.interfaces.Period
import java.time.LocalDate
import java.util.UUID

data class ContractExternalForm(
    val personId: UUID,
    val hourlyRate: Double,
    val hoursPerWeek: Int,
    override val from: LocalDate,
    override val to: LocalDate?,
    val billable: Boolean,
) : Period
