package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.interfaces.Period
import java.time.LocalDate

data class ContractServiceForm(
    val monthlyCosts: Double,
    val description: String,
    override val from: LocalDate,
    override val to: LocalDate?,
) : Period
