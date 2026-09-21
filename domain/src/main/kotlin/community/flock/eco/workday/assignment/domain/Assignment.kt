package community.flock.eco.workday.assignment.domain

import community.flock.eco.workday.client.domain.Client
import community.flock.eco.workday.common.Hourly
import community.flock.eco.workday.common.Period
import community.flock.eco.workday.person.domain.Person
import community.flock.eco.workday.project.domain.Project
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
