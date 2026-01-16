package community.flock.eco.workday.application.mappers

import community.flock.eco.workday.domain.person.Person
import community.flock.eco.workday.user.mappers.toDomain
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
        user = user?.toDomain(),
    )
