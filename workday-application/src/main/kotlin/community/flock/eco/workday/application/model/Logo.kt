package community.flock.eco.workday.application.model

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import java.time.Instant
import java.util.UUID

/**
 * A company logo in the collection everybody shares, to show next to an assignment on
 * a CV. The image is kept as is; [contentType] is what its bytes turned out to be.
 */
@Entity
class Logo(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(unique = true, length = NAME_LENGTH)
    val name: String,
    val contentType: String,
    @Column(length = MAX_SIZE)
    val data: ByteArray,
    val updatedAt: Instant = Instant.now(),
) {
    override fun toString(): String = "Logo(id=$id, name='$name', contentType=$contentType)"

    companion object {
        const val NAME_LENGTH = 100

        /** Logos are small: half a megabyte is plenty. */
        const val MAX_SIZE = 512 * 1024
    }
}
