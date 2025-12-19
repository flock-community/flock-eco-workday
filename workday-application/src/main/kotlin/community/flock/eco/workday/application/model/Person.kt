package community.flock.eco.workday.application.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.workday.user.model.User
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToOne
import java.time.Instant
import java.time.LocalDate
import java.util.Objects
import java.util.UUID

@Entity
data class Person(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long = 0,
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
    @OneToOne(fetch= FetchType.EAGER)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    @JsonIdentityReference(alwaysAsId = true)
    val user: User?,
) {
    fun getFullName(): String {
        return "$firstname $lastname"
    }

    override fun hashCode(): Int {
        return Objects.hashCode(uuid)
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false
        if (javaClass != other.javaClass) return false
        val otherPerson = other as Person
        return Objects.equals(uuid, otherPerson.uuid)
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
