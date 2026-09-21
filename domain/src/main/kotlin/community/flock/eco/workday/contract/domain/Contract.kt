package community.flock.eco.workday.contract.domain

import community.flock.eco.workday.common.Period

/**
 * An agreement that costs Flock money during a period: the employment of a person
 * ([ContractInternal]), the hiring of a freelancer ([ContractExternal]), a management fee
 * ([ContractManagement]) or a running service ([ContractService]).
 */
sealed interface Contract : Period {
    val internalId: Long
    val code: String
}
