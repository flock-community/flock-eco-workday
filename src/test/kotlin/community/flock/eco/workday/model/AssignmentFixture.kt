package community.flock.eco.workday.model

import java.time.LocalDate

fun anAssignment(
    person: Person = aPerson(),
    client: Client = aClient(),
) = Assignment(
    from = LocalDate.parse("2024-01-01"),
    to = LocalDate.parse("2024-12-31"),
    hourlyRate = 100.0,
    hoursPerWeek = 40,
    client = client,
    person = person,
)
