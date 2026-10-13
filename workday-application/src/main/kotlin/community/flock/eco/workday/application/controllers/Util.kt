package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.model.Person
import org.springframework.security.core.Authentication
import java.util.UUID
import community.flock.eco.workday.api.model.UUID as UUIDApi

fun UUID.produce(): UUIDApi = UUIDApi(toString()).also(UUIDApi::validate)

/** The UUID in this string, ignoring surrounding whitespace; null when it holds none. */
fun String.toUuidOrNull(): UUID? = runCatching { UUID.fromString(trim()) }.getOrNull()

/**
 * Checks if the current user (through the provided Authentication) is associated
 * with the given person
 *
 * @param person The person whose user code is being checked.
 * @return True if the person's user code matches the authentication name; otherwise, false.
 * @deprecated
 */
@Deprecated("Use isAssociatedWith(person: community.flock.eco.workday.domain.person.Person) instead")
fun Authentication.isAssociatedWith(person: Person) = person.user?.code == this.name

/**
 * Checks if the current user (through the provided Authentication) is associated
 * with the given person
 *
 * @param person The person whose user code is being checked.
 * @return True if the person's user code matches the authentication name; otherwise, false.
 */
fun Authentication.isAssociatedWith(person: community.flock.eco.workday.domain.person.Person) = person.user?.code == this.name
