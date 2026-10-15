package community.flock.eco.workday.application.authorities

import community.flock.eco.workday.application.services.PersonService
import community.flock.eco.workday.application.services.isUser
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
import java.util.UUID

/** Checks for `@PreAuthorize` expressions on persons, used there as `@personSecurity`. */
@Component
class PersonSecurity(
    private val personService: PersonService,
) {
    /** Whether the person with [uuid] is the one linked to the logged-in user. */
    fun isOwnPerson(
        authentication: Authentication,
        uuid: String,
    ): Boolean =
        runCatching { UUID.fromString(uuid) }
            .getOrNull()
            ?.let(personService::findByUuid)
            ?.isUser(authentication.name) == true
}
