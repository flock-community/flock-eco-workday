package community.flock.eco.workday.application.model

import community.flock.eco.workday.application.utils.toDataUrl
import jakarta.persistence.Column
import jakarta.persistence.Embeddable

/**
 * A person's photo, shown in the header of each of their CVs; [contentType] is what
 * its bytes turned out to be. Embedded in the person's table: when both columns are
 * null Hibernate hydrates the embedded attribute as null.
 */
@Embeddable
class Photo(
    @Column(name = "photo_content_type")
    val contentType: String,
    @Column(name = "photo_data", length = MAX_SIZE)
    val data: ByteArray,
) {
    /** The photo as a data URL the browser can use directly as an `<img src>`. */
    fun toDataUrl(): String = data.toDataUrl(contentType)

    companion object {
        /** The photo is small: half a megabyte is plenty, same ceiling as a [Logo]. */
        const val MAX_SIZE = 512 * 1024
    }
}
