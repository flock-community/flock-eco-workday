package community.flock.eco.workday.forms

import community.flock.eco.workday.interfaces.Period
import java.time.LocalDate

data class ContractManagementForm(

    val personCode: String,

    val monthlyFee: Double,

    override val from: LocalDate,
    override val to: LocalDate?
) : Period
