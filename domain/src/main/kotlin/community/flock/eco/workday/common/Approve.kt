package community.flock.eco.workday.common

/**
 * @deprecated use [Approvable]
 */
@Deprecated("use [Approvable]")
interface Approve {
    val status: Status
}

interface Approvable<T : ApprovalStatus> {
    val status: T
}
