package community.flock.eco.workday.forms

import community.flock.eco.workday.interfaces.ExpenseForm
import community.flock.eco.workday.model.Status
import java.time.LocalDate
import java.util.UUID

data class TravelExpenseForm (
    override val personCode: UUID,
    override val date: LocalDate,
    override val status: Status,

    val distance: Double,
    val allowance: Double

): ExpenseForm
