package community.flock.eco.workday.forms

import java.time.LocalDate

data class ContractInternalForm(

    val personCode: String,

    val monthlySalary: Double,
    val hoursPerWeek: Int,

    val startDate: LocalDate,
    val endDate: LocalDate?
)
