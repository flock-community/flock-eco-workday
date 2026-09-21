package community.flock.eco.workday.leaveday.domain

import community.flock.eco.workday.common.Approvable
import community.flock.eco.workday.common.ApprovalStatus
import community.flock.eco.workday.common.Day
import community.flock.eco.workday.person.domain.Person
import java.time.LocalDate

/**
 * Hours a person is away over a range of days: holiday, a plus day, parental leave or other paid
 * leave, submitted for approval.
 */
data class LeaveDay<T : ApprovalStatus>(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate,
    override val hours: Double,
    override val days: List<Double>?,
    val description: String,
    val type: LeaveDayType,
    override val status: T,
    val person: Person,
) : Day,
    Approvable<T>
