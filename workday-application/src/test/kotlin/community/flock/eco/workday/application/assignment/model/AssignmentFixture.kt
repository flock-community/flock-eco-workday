package community.flock.eco.workday.application.assignment.model

import community.flock.eco.workday.application.client.model.Client
import community.flock.eco.workday.application.client.model.aClient
import community.flock.eco.workday.application.person.model.Person
import community.flock.eco.workday.application.person.model.aPerson
import java.time.LocalDate

fun anAssignment(
    person: Person = aPerson(),
    client: Client = aClient(),
) = Assignment(
    from = LocalDate.of(2024, 1, 1),
    to = LocalDate.of(2024, 12, 31),
    hourlyRate = 100.0,
    hoursPerWeek = 40,
    client = client,
    person = person,
)
