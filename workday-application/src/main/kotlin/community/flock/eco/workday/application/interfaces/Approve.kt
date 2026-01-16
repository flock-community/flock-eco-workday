package community.flock.eco.workday.application.interfaces

import community.flock.eco.workday.application.mappers.toDomain
import community.flock.eco.workday.domain.common.Approvable
import community.flock.eco.workday.domain.common.ApprovalStatus
import community.flock.eco.workday.domain.common.Approve
import community.flock.eco.workday.domain.common.Status
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

fun <T : Approvable<*>> T.applyAllowedToUpdate(
    newStatus: ApprovalStatus,
    isAdmin: Boolean,
) = also { validateApprovalStatusChange(newStatus, newStatus, isAdmin) }

/**
 * @deprecates use applyAllowedToUpdate(status: ApprovalStatus, isAdmin: Boolean)
 */
@Deprecated("use applyAllowedToUpdate(status: ApprovalStatus, isAdmin: Boolean)")
fun <T : Approve> T.applyAllowedToUpdate(
    newStatus: Status,
    isAdmin: Boolean,
) = also { validateApprovalStatusChange(newStatus.toDomain(), newStatus.toDomain(), isAdmin) }

private fun validateApprovalStatusChange(
    currentStatus: ApprovalStatus,
    requestedNewStatus: ApprovalStatus,
    isAdmin: Boolean
) {
    if (currentStatus !== ApprovalStatus.REQUESTED && !isAdmin) {
        throw ResponseStatusException(
            HttpStatus.FORBIDDEN,
            "User is not allowed to change status",
        )
    }
    if (requestedNewStatus !== currentStatus && !isAdmin) {
        throw ResponseStatusException(
            HttpStatus.FORBIDDEN,
            "User is not allowed to change status field",
        )
    }
    if (requestedNewStatus !== currentStatus && !StatusTransition.check(currentStatus, requestedNewStatus)) {
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "This status change is not allowed")
    }
}

object StatusTransition {
    private val validStatusTransitions =
        mapOf(
            ApprovalStatus.REQUESTED to setOf(ApprovalStatus.APPROVED, ApprovalStatus.REJECTED),
            ApprovalStatus.APPROVED to setOf(ApprovalStatus.REQUESTED, ApprovalStatus.DONE),
            ApprovalStatus.REJECTED to setOf(ApprovalStatus.REQUESTED),
        )

    fun check(
        fromStatus: ApprovalStatus,
        toStatus: ApprovalStatus,
    ): Boolean = validStatusTransitions[fromStatus]?.contains(toStatus) ?: false
}
