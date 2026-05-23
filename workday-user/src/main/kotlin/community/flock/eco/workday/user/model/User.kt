package community.flock.eco.workday.user.model

import com.fasterxml.jackson.annotation.JsonBackReference
import community.flock.eco.workday.core.events.EventEntityListeners
import community.flock.eco.workday.core.model.AbstractIdEntity
import jakarta.persistence.Column
import jakarta.persistence.ElementCollection
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import java.time.LocalDateTime
import java.util.UUID

@Entity
@EntityListeners(EventEntityListeners::class)
class User(
    id: Long = 0,
    @Column(unique = true)
    val code: String = UUID.randomUUID().toString(),
    val name: String? = null,
    @Column(unique = true)
    val email: String,
    val enabled: Boolean = true,
    @ElementCollection(fetch = FetchType.EAGER)
    val authorities: MutableSet<String> = mutableSetOf(),
    @JsonBackReference
    @OneToMany(mappedBy = "user", fetch = FetchType.EAGER)
    val accounts: MutableSet<UserAccount> = mutableSetOf(),
    val created: LocalDateTime = LocalDateTime.now(),
    // Kratos identity UUID — Hydra puts this in the JWT's `sub` claim. Populated on the
    // user's first mobile sign-in; left null for users who have only ever signed in via
    // the legacy Google web flow. Unique-but-nullable so a user has at most one identity.
    @Column(name = "kratos_identity_id", unique = true)
    var kratosIdentityId: String? = null,
) : AbstractIdEntity(id) {
    override fun toString(): String = "User(id=$id, code='$code', name='$name', email='$email')"
}
