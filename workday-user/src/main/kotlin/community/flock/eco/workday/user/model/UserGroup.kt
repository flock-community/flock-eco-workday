package community.flock.eco.workday.user.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractIdEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import java.time.LocalDateTime
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
data class UserGroup(
    override val id: Long = 0,
    @Column(unique = true)
    val code: String = UUID.randomUUID().toString(),
    val name: String,
    @ManyToMany
    @JoinTable(
        name = "group_users",
        joinColumns = [JoinColumn(name = "group_id")],
        inverseJoinColumns = [JoinColumn(name = "user_id")],
    )
    @JsonIdentityReference(alwaysAsId = true)
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    val users: MutableSet<User> = mutableSetOf(),
    val created: LocalDateTime = LocalDateTime.now(),
) : AbstractIdEntity(id) {
    override fun equals(other: Any?) = super.equals(other)

    override fun hashCode() = super.hashCode()

    override fun toString() = super.toString()
}
