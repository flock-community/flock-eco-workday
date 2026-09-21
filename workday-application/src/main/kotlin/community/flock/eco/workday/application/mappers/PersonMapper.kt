package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.person.domain.Address
import community.flock.eco.workday.person.domain.Person
import community.flock.eco.workday.user.mappers.toDomain
import community.flock.eco.workday.application.model.Address as AddressEntity
import community.flock.eco.workday.application.model.Person as PersonEntity

fun PersonEntity.toDomain() =
    Person(
        internalId = id,
        uuid = uuid,
        firstname = firstname,
        lastname = lastname,
        email = email,
        position = position,
        number = number,
        birthdate = birthdate,
        joinDate = joinDate,
        active = active,
        lastActiveAt = lastActiveAt,
        reminders = reminders,
        receiveEmail = receiveEmail,
        shoeSize = shoeSize,
        shirtSize = shirtSize,
        googleDriveId = googleDriveId,
        address = address?.toDomain(),
        user = user?.toDomain(),
    )

fun AddressEntity.toDomain() =
    Address(
        street = street,
        houseNumber = houseNumber,
        houseNumberAddition = houseNumberAddition,
        postalCode = postalCode,
        city = city,
    )

fun Address.toEntity() =
    AddressEntity(
        street = street,
        houseNumber = houseNumber,
        houseNumberAddition = houseNumberAddition,
        postalCode = postalCode,
        city = city,
    )
