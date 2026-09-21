package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.laptop.domain.Laptop
import community.flock.eco.workday.application.model.Laptop as LaptopEntity

fun LaptopEntity.toDomain() =
    Laptop(
        internalId = id,
        code = code,
        name = name,
        serialNumber = serialNumber,
        contractSigned = contractSigned,
        purchaseDate = purchaseDate,
        person = person?.toDomain(),
    )
