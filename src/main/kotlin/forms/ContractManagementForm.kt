package community.flock.eco.workday.forms

import java.time.LocalDate

data class ContractManagementForm(

    val personCode: String,

    val monthlyFee: Double,

    val startDate: LocalDate,
    val endDate: LocalDate?
)
