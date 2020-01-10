package community.flock.eco.workday.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractCodeEntity
import community.flock.eco.feature.user.model.User
import java.util.UUID
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.OneToOne

@Entity
@EntityListeners(EventEntityListeners::class)
data class Person(
    override val id: Long = 0,
    override val code: String = UUID.randomUUID().toString(),

    val firstname: String,
    val lastname: String,
    val email: String,
    val position: String,
    val number: Int,

    @OneToOne
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    @JsonIdentityReference(alwaysAsId = true)
    val user: User?

) : AbstractCodeEntity(id, code) {
    override fun equals(obj: Any?): Boolean = super.equals(obj)
    override fun hashCode(): Int = super.hashCode()
    }
