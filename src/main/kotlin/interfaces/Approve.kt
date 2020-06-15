package community.flock.eco.workday.interfaces

import community.flock.eco.workday.forms.SickDayForm
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.Status
import org.springframework.http.HttpStatus
import org.springframework.security.core.Authentication
import org.springframework.web.server.ResponseStatusException

interface Approve {
    val status: Status
}

fun Approve.applyAllowedToUpdate(status: Status, isAdmin: Boolean) {
    if (this.status !== Status.REQUESTED && !isAdmin) {
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to change workday")
    }
    if (status !== this.status && !isAdmin) {
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "User is not allowed to change status field")
    }
}
