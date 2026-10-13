package community.flock.eco.workday.application.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.workday.core.model.AbstractIdEntity
import community.flock.eco.workday.user.model.User
import jakarta.persistence.Column
import jakarta.persistence.Embedded
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.OneToOne
import java.time.Instant
import java.time.LocalDate
import java.util.Objects
import java.util.UUID

@Entity
class Person(
    id: Long = 0,
    @Column(name = "code")
    val uuid: UUID = UUID.randomUUID(),
    val firstname: String,
    val lastname: String,
    val email: String,
    val position: String,
    val number: String?,
    val birthdate: LocalDate? = null,
    val joinDate: LocalDate? = null,
    val active: Boolean = true,
    val lastActiveAt: Instant? = null,
    val reminders: Boolean = false,
    val receiveEmail: Boolean = true,
    val shoeSize: String? = null,
    val shirtSize: String? = null,
    val googleDriveId: String? = null,
    @Embedded
    val address: Address? = null,
    @OneToOne(fetch = FetchType.EAGER)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    @JsonIdentityReference(alwaysAsId = true)
    val user: User?,
    /** The content type the photo's bytes turned out to be; null alongside [photoData]. */
    @JsonIgnore
    var photoContentType: String? = null,
    /** The person's photo, shown in the header of each of their CVs. */
    @JsonIgnore
    @Column(length = PHOTO_MAX_SIZE)
    var photoData: ByteArray? = null,
) : AbstractIdEntity(id) {
    fun getFullName(): String = "$firstname $lastname"

    override fun hashCode(): Int = Objects.hashCode(uuid)

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false
        if (javaClass != other.javaClass) return false
        val otherPerson = other as Person
        return Objects.equals(uuid, otherPerson.uuid)
    }

    override fun toString(): String = "Person(id=$id, uuid=$uuid, firstname='$firstname', lastname='$lastname', email='$email')"

    companion object {
        /** The photo is small: half a megabyte is plenty, same ceiling as a [Logo]. */
        const val PHOTO_MAX_SIZE = 512 * 1024
    }
}

/**
 * Minimal person projection which is typically more than enough to work with
 */
interface PersonProjection {
    fun getUuid(): UUID

    fun getFirstname(): String

    fun getLastname(): String

    fun getEmail(): String
}
