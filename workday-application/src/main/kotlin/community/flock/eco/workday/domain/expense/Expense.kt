package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.Approvable
import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate
import java.util.UUID

sealed interface Expense<T : ApprovalStatus> : Approvable<T> {
    val id: UUID
    val date: LocalDate
    val description: String?
    val person: Person
}
