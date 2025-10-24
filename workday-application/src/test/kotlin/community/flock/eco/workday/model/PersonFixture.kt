package community.flock.eco.workday.model

import community.flock.eco.workday.application.model.Person
import community.flock.eco.workday.user.model.User
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.UUID

fun aPerson() =
    Person(
        id = 3,
        UUID.randomUUID(),
        firstname = "Henk",
        lastname = "Henkszoon",
        email = "henk@hotmail.com",
        position = "Links-achter",
        number = "drie",
        birthdate = LocalDate.of(1990, 5, 27),
        joinDate = LocalDate.of(2020, 4, 5),
        active = true,
        lastActiveAt = Instant.now(),
        reminders = true,
        user =
            User(
                id = 4,
                code = UUID.randomUUID().toString(),
                name = "Henk Henkszoon",
                email = "henk@hotmail.com",
                enabled = true,
                authorities = setOf(),
                accounts = setOf(),
                created = LocalDateTime.of(2020, 4, 5, 14, 30),
            ),
    )
