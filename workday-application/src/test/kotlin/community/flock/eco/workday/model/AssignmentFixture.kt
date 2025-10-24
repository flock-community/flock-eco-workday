package community.flock.eco.workday.model

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
