package community.flock.eco.workday.contract.domain

import community.flock.eco.workday.common.Monthly
import community.flock.eco.workday.person.domain.Person
import java.math.BigDecimal
import java.time.LocalDate

/**
 * The employment contract of a person: a monthly salary for a number of hours a week, with the
 * yearly leave, hack time and training budgets that come with it.
 */
data class ContractInternal(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate?,
    val person: Person,
    override val monthlySalary: Double,
    override val hoursPerWeek: Int,
    val holidayHours: Int,
    val hackTimeBudget: Int,
    val trainingTimeBudget: Int,
    val trainingMoneyBudget: BigDecimal,
    val billable: Boolean,
) : Contract,
    Monthly
