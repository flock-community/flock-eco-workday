package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.contract.domain.Contract
import community.flock.eco.workday.contract.domain.ContractExternal
import community.flock.eco.workday.contract.domain.ContractInternal
import community.flock.eco.workday.contract.domain.ContractManagement
import community.flock.eco.workday.contract.domain.ContractService
import community.flock.eco.workday.application.model.Contract as ContractEntity
import community.flock.eco.workday.application.model.ContractExternal as ContractExternalEntity
import community.flock.eco.workday.application.model.ContractInternal as ContractInternalEntity
import community.flock.eco.workday.application.model.ContractManagement as ContractManagementEntity
import community.flock.eco.workday.application.model.ContractService as ContractServiceEntity

fun ContractEntity.toDomain(): Contract =
    when (this) {
        is ContractInternalEntity -> this.toDomain()
        is ContractExternalEntity -> this.toDomain()
        is ContractManagementEntity -> this.toDomain()
        is ContractServiceEntity -> this.toDomain()
        else -> error("Cannot map contract $code of type $type into a domain object")
    }

fun ContractInternalEntity.toDomain() =
    ContractInternal(
        internalId = id,
        code = code,
        from = from,
        to = to,
        person = requirePerson(),
        monthlySalary = monthlySalary,
        hoursPerWeek = hoursPerWeek,
        holidayHours = holidayHours,
        hackTimeBudget = hackTimeBudget,
        trainingTimeBudget = trainingTimeBudget,
        trainingMoneyBudget = trainingMoneyBudget,
        billable = billable,
    )

fun ContractExternalEntity.toDomain() =
    ContractExternal(
        internalId = id,
        code = code,
        from = from,
        to = to,
        person = requirePerson(),
        hourlyRate = hourlyRate,
        hoursPerWeek = hoursPerWeek,
        billable = billable,
    )

fun ContractManagementEntity.toDomain() =
    ContractManagement(
        internalId = id,
        code = code,
        from = from,
        to = to,
        person = requirePerson(),
        monthlyFee = monthlyFee,
    )

fun ContractServiceEntity.toDomain() =
    ContractService(
        internalId = id,
        code = code,
        from = from,
        to = to,
        monthlyCosts = monthlyCosts,
        description = description,
    )

private fun ContractEntity.requirePerson() = requireNotNull(person) { "Contract $code of type $type has no person" }.toDomain()
