package community.flock.eco.workday.domain.contract

import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate

/** A management fee paid to a person every month. */
data class ContractManagement(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate?,
    val person: Person,
    val monthlyFee: Double,
) : Contract
