package community.flock.eco.workday.domain.expense

import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Page
import community.flock.eco.workday.domain.common.Pageable
import community.flock.eco.workday.domain.common.Status
import java.util.UUID

interface ExpensePersistencePort {
    fun findAll(pageable: Pageable): Page<Expense<*>>

    fun findByIdOrNull(id: UUID): Expense<*>?

    fun findAllByPersonUuid(
        personId: UUID,
        pageable: Pageable,
    ): Page<Expense<*>>

    fun findAllByPersonUserCode(
        personCode: String,
        pageable: Pageable,
    ): Page<Expense<*>>

    fun findAllByStatus(status: Status): List<Expense<*>>

    fun delete(id: UUID): Expense<*>?
}
