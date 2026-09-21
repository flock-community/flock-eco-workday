package community.flock.eco.workday.contract.domain

import community.flock.eco.workday.person.domain.Person
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
