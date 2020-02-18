package community.flock.eco.workday.forms

import java.time.LocalDate

data class ContractExternalForm(

    val personCode: String,

    val hourlyRate: Double,
    val hoursPerWeek: Int,

    val startDate: LocalDate,
    val endDate: LocalDate?
)
