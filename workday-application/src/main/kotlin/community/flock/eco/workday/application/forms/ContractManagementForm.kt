package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.interfaces.Period
import java.time.LocalDate
import java.util.UUID

data class ContractManagementForm(
    val personId: UUID,
    val monthlyFee: Double,
    override val from: LocalDate,
    override val to: LocalDate?,
) : Period
