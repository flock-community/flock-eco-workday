package community.flock.eco.workday.interfaces

import community.flock.eco.workday.model.Status
import java.time.LocalDate
import java.util.UUID

interface ExpenseForm {
    val personCode: UUID
    val date: LocalDate
    val description: String
    val status: Status
}
