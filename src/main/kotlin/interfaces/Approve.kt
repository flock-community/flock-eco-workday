package community.flock.eco.workday.interfaces

import community.flock.eco.workday.model.Status
import org.springframework.http.HttpStatus
import org.springframework.web.server.ResponseStatusException

interface Approve {
    val status: Status
}

fun Approve.applyAllowedToUpdate(status: Status, isAdmin: Boolean) {
    if (this.status !== Status.REQUESTED && !isAdmin) {
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to change status")
    }
    if (status !== this.status && !isAdmin) {
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to change status field")
    }
    if (status !== this.status && !StatusTransition.check(this.status, status)) {
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "This status change is not allowed")
    }
}

object StatusTransition {
    private val validStatusTransitions = mapOf(
        Status.REQUESTED to arrayOf(Status.APPROVED, Status.REJECTED),
        Status.APPROVED to arrayOf(Status.REQUESTED, Status.DONE),
        Status.REJECTED to arrayOf(Status.REQUESTED)
    )

    fun check(fromStatus: Status, toStatus: Status): Boolean =
        if (validStatusTransitions.containsKey(fromStatus)) {
            validStatusTransitions[fromStatus]!!.contains(toStatus)
        } else {
            false
        }
}
