package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.feature.user.model.User
import java.util.*
import javax.persistence.*

@Entity
data class Person(

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    val id: Long = 0,

    @Column(name="code")
    val uuid: UUID = UUID.randomUUID(),

    val firstname: String,
    val lastname: String,
    val email: String,
    val position: String,
    val number: String?,

    @OneToOne
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    @JsonIdentityReference(alwaysAsId = true)
    val user: User?

){

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

