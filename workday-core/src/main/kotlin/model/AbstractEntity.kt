package community.flock.eco.core.model

import java.io.Serializable
import javax.persistence.Id
import javax.persistence.MappedSuperclass

@MappedSuperclass
abstract class AbstractEntity<ID : Serializable>(
    @Id
    open val id: ID,
) : Serializable {
    override fun hashCode(): Int {
        return 13
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false
        if (javaClass != other.javaClass) return false
        val otherAbstractEntity = other as AbstractEntity<*>
        return (id != 0L) && (id == otherAbstractEntity.id)
    }

    override fun toString() = "Entity of type ${this.javaClass.name} with id: $id"
}
