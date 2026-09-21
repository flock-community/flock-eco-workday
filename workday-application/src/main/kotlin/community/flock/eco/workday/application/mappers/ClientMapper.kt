package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.client.domain.Client
import community.flock.eco.workday.application.model.Client as ClientEntity

fun ClientEntity.toDomain() =
    Client(
        internalId = id,
        code = code,
        name = name,
    )
