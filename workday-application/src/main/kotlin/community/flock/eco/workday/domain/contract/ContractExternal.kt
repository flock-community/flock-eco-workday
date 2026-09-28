package community.flock.eco.workday.domain.contract

import community.flock.eco.workday.domain.common.Hourly
import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate

/** The contract of a freelancer: an hourly rate for a number of hours a week. */
data class ContractExternal(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate?,
    val person: Person,
    override val hourlyRate: Double,
    override val hoursPerWeek: Int,
    val billable: Boolean,
) : Contract,
    Hourly
