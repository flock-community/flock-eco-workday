package community.flock.eco.workday.controllers

import community.flock.eco.workday.api.validate
import community.flock.eco.workday.model.Person
import org.springframework.security.core.Authentication
import java.util.UUID
import community.flock.eco.workday.api.UUID as UUIDApi

fun UUID.produce(): UUIDApi = UUIDApi(toString()).also(UUIDApi::validate)

/**
 * Checks if the current user (through the provided Authentication) is associated
 * with the given person
 *
 * @param person The person whose user code is being checked.
 * @return True if the person's user code matches the authentication name; otherwise, false.
 */
fun Authentication.isAssociatedWith(person: Person) = person.user?.code == this.name
