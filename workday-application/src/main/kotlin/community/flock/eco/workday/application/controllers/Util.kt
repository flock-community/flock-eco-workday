package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.model.Client
import community.flock.eco.workday.application.model.Document
import community.flock.eco.workday.application.model.Person
import org.springframework.security.core.Authentication
import java.util.UUID
import community.flock.eco.workday.api.model.Client as ClientApi
import community.flock.eco.workday.api.model.ClientLogo as ClientLogoApi
import community.flock.eco.workday.api.model.UUID as UUIDApi

fun UUID.produce(): UUIDApi = UUIDApi(toString()).also(UUIDApi::validate)

fun Client.produce(): ClientApi =
    ClientApi(
        id = id,
        code = code,
        name = name,
        logo = logo?.produceClientLogo(),
    )

fun Document.produceClientLogo(): ClientLogoApi = ClientLogoApi(name = name, file = file.produce())

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
