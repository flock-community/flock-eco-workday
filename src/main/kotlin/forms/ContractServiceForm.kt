package community.flock.eco.workday.forms

import java.time.LocalDate

data class ContractServiceForm(

    val monthlyCosts: Double,

    val description: String,

    val startDate: LocalDate,
    val endDate: LocalDate?
)
