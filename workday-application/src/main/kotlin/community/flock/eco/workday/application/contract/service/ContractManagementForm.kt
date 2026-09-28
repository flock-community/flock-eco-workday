package community.flock.eco.workday.application.contract.service

import community.flock.eco.workday.application.common.model.Period
import java.time.LocalDate
import java.util.UUID

data class ContractManagementForm(
    val personId: UUID,
    val monthlyFee: Double,
    override val from: LocalDate,
    override val to: LocalDate?,
) : Period
