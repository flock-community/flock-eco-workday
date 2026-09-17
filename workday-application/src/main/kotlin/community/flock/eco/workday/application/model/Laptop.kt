package community.flock.eco.workday.application.model

import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractCodeEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.ManyToOne
import java.time.LocalDate
import java.util.UUID

/**
 * A company laptop. The serial number identifies the physical device, the name is
 * how people refer to it and [purchaseDate] is the day it was bought (unknown for
 * some older devices, hence optional). A laptop can be handed out to a person, in
 * which case the person has to sign a laptop contract; [contractSigned] tracks
 * whether that happened.
 */
@Entity
@EntityListeners(EventEntityListeners::class)
class Laptop(
    id: Long = 0,
    code: String = UUID.randomUUID().toString(),
    val name: String,
    @Column(unique = true)
    val serialNumber: String,
    val contractSigned: Boolean = false,
    val purchaseDate: LocalDate? = null,
    @ManyToOne
    val person: Person? = null,
) : AbstractCodeEntity(id, code) {
    override fun toString(): String = "Laptop(id=$id, code=$code, name='$name', serialNumber='$serialNumber')"
}
