package community.flock.eco.workday.application.forms

import community.flock.eco.workday.application.interfaces.Period
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

data class ContractInternalForm(
    val personId: UUID,
    val monthlySalary: Double,
    val hoursPerWeek: Int,
    override val from: LocalDate,
    override val to: LocalDate?,
    val holidayHours: Int,
    val hackTimeBudget: Int,
    val billable: Boolean,
    val trainingTimeBudget: Int = 0,
    val trainingMoneyBudget: BigDecimal = BigDecimal.ZERO,
) : Period
