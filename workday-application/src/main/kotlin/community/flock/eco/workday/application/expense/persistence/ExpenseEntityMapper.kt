package community.flock.eco.workday.application.expense.persistence

import community.flock.eco.workday.application.common.model.toDomain
import community.flock.eco.workday.application.common.model.toEntity
import community.flock.eco.workday.application.person.model.Person
import community.flock.eco.workday.application.person.model.toDomain
import community.flock.eco.workday.domain.expense.CostExpense
import community.flock.eco.workday.domain.expense.TravelExpense
import community.flock.eco.workday.application.expense.model.CostExpense as CostExpenseEntity
import community.flock.eco.workday.application.expense.model.TravelExpense as TravelExpenseEntity

fun TravelExpense<*>.toEntity(personEntity: Person) =
    TravelExpenseEntity(
        id = id,
        date = date,
        description = description,
        person = personEntity,
        status = status.toEntity(),
        distance = distance,
        allowance = allowance,
    )

fun TravelExpenseEntity.toDomain() =
    TravelExpense(
        id = id,
        date = date,
        description = description,
        person = person.toDomain(),
        status = status.toDomain(),
        distance = distance,
        allowance = allowance,
    )

fun CostExpense<*>.toEntity(personReference: Person) =
    CostExpenseEntity(
        id = id,
        date = date,
        description = description,
        person = personReference,
        status = status.toEntity(),
        amount = amount,
        files = files.map { it.toEntity() }.toMutableList(),
    )

fun CostExpenseEntity.toDomain() =
    CostExpense(
        id = id,
        date = date,
        description = description,
        person = person.toDomain(),
        status = status.toDomain(),
        amount = amount,
        files = files.map { it.toDomain() },
    )
