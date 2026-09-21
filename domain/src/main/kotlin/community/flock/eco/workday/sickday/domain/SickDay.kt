package community.flock.eco.workday.sickday.domain

import community.flock.eco.workday.common.Approvable
import community.flock.eco.workday.common.ApprovalStatus
import community.flock.eco.workday.common.Day
import community.flock.eco.workday.person.domain.Person
import java.time.LocalDate

/** Hours a person was ill over a range of days, submitted for approval. */
data class SickDay<T : ApprovalStatus>(
    override val internalId: Long,
    override val code: String,
    override val from: LocalDate,
    override val to: LocalDate,
    override val hours: Double,
    override val days: List<Double>?,
    val description: String?,
    override val status: T,
    val person: Person,
) : Day,
    Approvable<T>
