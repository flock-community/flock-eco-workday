package community.flock.eco.workday.application.contract.service

import community.flock.eco.workday.application.common.model.Period
import java.time.LocalDate

data class ContractServiceForm(
    val monthlyCosts: Double,
    val description: String,
    override val from: LocalDate,
    override val to: LocalDate?,
) : Period
