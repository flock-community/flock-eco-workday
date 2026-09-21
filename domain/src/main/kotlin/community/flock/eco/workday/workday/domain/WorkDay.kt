package community.flock.eco.workday.workday.domain

import community.flock.eco.workday.assignment.domain.Assignment
import community.flock.eco.workday.common.Approvable
import community.flock.eco.workday.common.ApprovalStatus
import community.flock.eco.workday.common.Day
import community.flock.eco.workday.common.Document
import java.time.LocalDate

/**
 * Hours a person worked on an assignment over a range of days, submitted for approval together
 * with the time sheets that back them.
 */
data class WorkDay<T : ApprovalStatus>(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate,
    override val hours: Double,
    override val days: List<Double>?,
    val assignment: Assignment,
    override val status: T,
    val sheets: List<Document>,
) : Day,
    Approvable<T>
