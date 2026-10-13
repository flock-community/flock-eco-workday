package community.flock.eco.workday.application.forms

import com.fasterxml.jackson.annotation.JsonIgnore
import community.flock.eco.workday.domain.person.Address
import java.time.LocalDate

data class PersonForm(
    val firstname: String,
    val lastname: String,
    val email: String,
    val position: String,
    val number: String?,
    val birthdate: LocalDate? = null,
    val joinDate: LocalDate? = null,
    val active: Boolean,
    val userCode: String?,
    val reminders: Boolean = false,
    val receiveEmail: Boolean = true,
    val shoeSize: String? = null,
    val shirtSize: String? = null,
    val googleDriveId: String? = null,
    val address: Address? = null,
    /** What saving does to the person's photo. */
    @get:JsonIgnore
    val photo: PhotoChange = PhotoChange.Keep,
)

/** The photo is shown in the header of each of the person's CVs. */
sealed interface PhotoChange {
    /** Leaves the photo as it is. */
    data object Keep : PhotoChange

    /** Removes the photo. */
    data object Remove : PhotoChange

    /** Replaces the photo with these bytes. */
    class Replace(
        val data: ByteArray,
    ) : PhotoChange
}
