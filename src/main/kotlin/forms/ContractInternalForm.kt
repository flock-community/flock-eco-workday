package community.flock.eco.workday.forms

import community.flock.eco.workday.interfaces.Period
import java.time.LocalDate

data class ContractInternalForm(

    val personCode: String,

    val monthlySalary: Double,
    val hoursPerWeek: Int,

    override val from: LocalDate,
    override val to: LocalDate?
) : Period
