package community.flock.eco.workday.domain.laptop

import community.flock.eco.workday.domain.person.Person
import java.time.LocalDate

/**
 * A company laptop. The serial number identifies the physical device, the name is how people
 * refer to it and [purchaseDate] is the day it was bought, unknown for some older devices. A
 * laptop can be handed out to a [person], who then has to sign a laptop contract;
 * [contractSigned] tracks whether that happened.
 */
data class Laptop(
    val internalId: Long,
    val code: String,
    val name: String,
    val serialNumber: String,
    val contractSigned: Boolean,
    val purchaseDate: LocalDate?,
    val person: Person?,
)
