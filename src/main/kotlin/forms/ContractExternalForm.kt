package community.flock.eco.workday.forms

import community.flock.eco.workday.interfaces.Period
import java.time.LocalDate

data class ContractExternalForm(

    val personCode: String,

    val hourlyRate: Double,
    val hoursPerWeek: Int,

    override val from: LocalDate,
    override val to: LocalDate?
) : Period
