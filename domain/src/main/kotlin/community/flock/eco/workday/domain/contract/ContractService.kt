package community.flock.eco.workday.domain.contract

import java.time.LocalDate

/** A service Flock pays for every month, such as a subscription or a supplier. It has no person. */
data class ContractService(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate?,
    val monthlyCosts: Double,
    val description: String,
) : Contract
