package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.domain.event.BudgetCategory
import community.flock.eco.workday.domain.event.Event
import community.flock.eco.workday.domain.event.EventDay
import community.flock.eco.workday.domain.event.EventRating
import community.flock.eco.workday.domain.event.EventType
import community.flock.eco.workday.application.model.BudgetCategory as BudgetCategoryEntity
import community.flock.eco.workday.application.model.Event as EventEntity
import community.flock.eco.workday.application.model.EventDay as EventDayEntity
import community.flock.eco.workday.application.model.EventRating as EventRatingEntity
import community.flock.eco.workday.application.model.EventType as EventTypeEntity

fun EventEntity.toDomain() =
    Event(
        internalId = id,
        code = code,
        description = description,
        from = from,
        to = to,
        hours = hours,
        days = days?.toList(),
        costs = costs,
        type = type.toDomain(),
        eventDays = eventDays.map { it.toDomain() },
    )

fun EventDayEntity.toDomain() =
    EventDay(
        internalId = id,
        code = code,
        from = from,
        to = to,
        hours = hours,
        days = days?.toList(),
        cost = cost,
        budgetCategory = budgetCategory?.toDomain(),
        person = person.toDomain(),
    )

fun EventRatingEntity.toDomain() =
    EventRating(
        event = event.toDomain(),
        person = person.toDomain(),
        rating = rating,
    )

fun EventTypeEntity.toDomain(): EventType =
    when (this) {
        EventTypeEntity.FLOCK_HACK_DAY -> EventType.FLOCK_HACK_DAY
        EventTypeEntity.FLOCK_COMMUNITY_DAY -> EventType.FLOCK_COMMUNITY_DAY
        EventTypeEntity.CONFERENCE -> EventType.CONFERENCE
        EventTypeEntity.GENERAL_EVENT -> EventType.GENERAL_EVENT
    }

fun BudgetCategoryEntity.toDomain(): BudgetCategory =
    when (this) {
        BudgetCategoryEntity.HACK -> BudgetCategory.HACK
        BudgetCategoryEntity.TRAINING -> BudgetCategory.TRAINING
    }
