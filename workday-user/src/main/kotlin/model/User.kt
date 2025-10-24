package community.flock.eco.feature.user.model

import com.fasterxml.jackson.annotation.JsonBackReference
import community.flock.eco.core.events.EventEntityListeners
import community.flock.eco.core.model.AbstractIdEntity
import java.time.LocalDateTime
import java.util.UUID
import javax.persistence.Column
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.EntityListeners
import javax.persistence.FetchType
import javax.persistence.OneToMany

@Entity
@EntityListeners(EventEntityListeners::class)
data class User(
    override val id: Long = 0,
    @Column(unique = true)
    val code: String = UUID.randomUUID().toString(),
    val name: String? = null,
    @Column(unique = true)
    val email: String,
    val enabled: Boolean = true,
    @ElementCollection(fetch = FetchType.EAGER)
    val authorities: Set<String> = setOf(),
    @JsonBackReference
    @OneToMany(mappedBy = "user")
    val accounts: Set<UserAccount> = setOf(),
    val created: LocalDateTime = LocalDateTime.now(),
) : AbstractIdEntity(id) {
    override fun equals(other: Any?) = super.equals(other)

    override fun hashCode() = super.hashCode()

    override fun toString() = super.toString()
}
