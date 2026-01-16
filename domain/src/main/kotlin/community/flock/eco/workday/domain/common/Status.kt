package community.flock.eco.workday.domain.common

sealed interface ApprovalStatus {
    data object REQUESTED : ApprovalStatus

    data object APPROVED : ApprovalStatus

    data object REJECTED : ApprovalStatus

    data object DONE : ApprovalStatus
}

/**
 * @deprecated use [ApprovalStatus] instead
 */
@Deprecated("Use [ApprovalStatus] instead")
enum class Status {
    REQUESTED,
    APPROVED,
    REJECTED,
    DONE,
}
