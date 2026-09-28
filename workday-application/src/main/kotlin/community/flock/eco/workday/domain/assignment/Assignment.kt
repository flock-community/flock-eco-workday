package community.flock.eco.workday.domain.assignment

import community.flock.eco.workday.domain.client.Client
import community.flock.eco.workday.domain.common.Hourly
import community.flock.eco.workday.domain.common.Period
import community.flock.eco.workday.domain.person.Person
import community.flock.eco.workday.domain.project.Project
import java.time.LocalDate

/**
 * A person working for a client during a period at an hourly rate. Work days are registered
 * against an assignment, which is what makes them billable.
 */
data class Assignment(
    val internalId: Long,
    val code: String,
    val role: String?,
    override val from: LocalDate,
    override val to: LocalDate?,
    override val hourlyRate: Double,
    override val hoursPerWeek: Int,
    val client: Client,
    val person: Person,
    val project: Project?,
) : Period,
    Hourly
