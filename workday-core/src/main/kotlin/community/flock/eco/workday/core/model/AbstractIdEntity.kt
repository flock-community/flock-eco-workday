package community.flock.eco.workday.core.model

import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import java.io.Serializable

@MappedSuperclass
abstract class AbstractIdEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    open val id: Long = 0,
) : Serializable {
    override fun hashCode(): Int = 13

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false
        if (javaClass != other.javaClass) return false
        val otherEntity = other as AbstractIdEntity
        return id != 0L && id == otherEntity.id
    }

    override fun toString() = "Entity of type ${this.javaClass.name} with id: $id"
}
