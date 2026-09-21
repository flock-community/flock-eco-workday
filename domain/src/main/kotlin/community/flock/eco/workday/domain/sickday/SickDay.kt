package community.flock.eco.workday.domain.sickday

import community.flock.eco.workday.domain.common.Approvable
import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Day
import community.flock.eco.workday.domain.person.Person
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
