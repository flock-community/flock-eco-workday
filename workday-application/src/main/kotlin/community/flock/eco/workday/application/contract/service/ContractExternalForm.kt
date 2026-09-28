package community.flock.eco.workday.application.contract.service

import community.flock.eco.workday.application.common.model.Period
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
