package community.flock.eco.workday.expense.domain

import community.flock.eco.workday.common.Approvable
import community.flock.eco.workday.common.ApprovalStatus
import community.flock.eco.workday.person.domain.Person
import java.time.LocalDate
import java.util.UUID

sealed interface Expense<T : ApprovalStatus> : Approvable<T> {
    val id: UUID
    val date: LocalDate
    val description: String?
    val person: Person
}
