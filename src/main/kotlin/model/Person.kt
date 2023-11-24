package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.feature.user.model.User
import java.time.Instant
import java.time.LocalDate
import java.util.Objects
import java.util.UUID
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.OneToOne

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

    @OneToOne
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    @JsonIdentityReference(alwaysAsId = true)
    val user: User?

) {

    fun getFullName(): String {
        return "$firstname $lastname"
    }

    override fun hashCode(): Int {
        return Objects.hashCode(uuid)
    }

    override fun equals(obj: Any?): Boolean {
        if (this === obj) return true
        if (obj == null) return false
        if (javaClass != obj.javaClass) return false
        val other = obj as Person
        return Objects.equals(uuid, other.uuid)
    }
}
