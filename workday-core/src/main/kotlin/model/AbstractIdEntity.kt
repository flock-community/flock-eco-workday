package community.flock.eco.core.model

import java.io.Serializable
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.MappedSuperclass

@MappedSuperclass
abstract class AbstractIdEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    open val id: Long = 0,
) : Serializable {
    override fun hashCode(): Int {
        return 13
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false
        if (javaClass != other.javaClass) return false
        val otherEntity = other as AbstractIdEntity
        return id != 0L && id == otherEntity.id
    }

    override fun toString() = "Entity of type ${this.javaClass.name} with id: $id"
}
