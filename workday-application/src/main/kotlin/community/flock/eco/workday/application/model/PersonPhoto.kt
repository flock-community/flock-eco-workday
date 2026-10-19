package community.flock.eco.workday.application.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id

/**
 * The person's photo, shown in the header of each of their CVs. Kept apart from [Person] so
 * loading a person, which happens everywhere, does not load the photo's bytes as well.
 */
@Entity
class PersonPhoto(
    @Id
    val personId: Long,
    /** What the photo's bytes turned out to be. */
    var contentType: String,
    @Column(length = MAX_SIZE)
    var data: ByteArray,
) {
    override fun toString(): String = "PersonPhoto(personId=$personId, contentType=$contentType)"

    companion object {
        /** The photo is small: half a megabyte is plenty, same ceiling as a [Logo]. */
        const val MAX_SIZE = 512 * 1024
    }
}
