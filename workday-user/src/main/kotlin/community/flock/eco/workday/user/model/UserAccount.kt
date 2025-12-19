package community.flock.eco.workday.user.model

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.JsonIdentityReference
import com.fasterxml.jackson.annotation.JsonSubTypes
import com.fasterxml.jackson.annotation.JsonTypeInfo
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import community.flock.eco.workday.core.model.AbstractIdEntity
import jakarta.persistence.Entity
import jakarta.persistence.Inheritance
import jakarta.persistence.InheritanceType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import java.time.LocalDateTime

@Entity
@Inheritance(
    strategy = InheritanceType.JOINED,
)
@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "type",
)
@JsonSubTypes(
    value = [
        JsonSubTypes.Type(value = UserAccountPassword::class, name = "PASSWORD"),
        JsonSubTypes.Type(value = UserAccountKey::class, name = "KEY"),
        JsonSubTypes.Type(value = UserAccountOauth::class, name = "OAUTH"),
    ],
)
abstract class UserAccount(
    override val id: Long = 0,
    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "code")
    @JsonIdentityReference(alwaysAsId = true)
    open val user: User,
    open val created: LocalDateTime = LocalDateTime.now(),
) : AbstractIdEntity(id)
