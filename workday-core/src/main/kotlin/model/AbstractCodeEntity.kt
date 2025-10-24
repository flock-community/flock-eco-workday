package community.flock.eco.core.model

import java.util.Objects
import java.util.UUID
import javax.persistence.Column
import javax.persistence.MappedSuperclass

@MappedSuperclass
abstract class AbstractCodeEntity(
    override val id: Long = 0,
    @Column(unique = true)
    open val code: String = UUID.randomUUID().toString(),
) : AbstractIdEntity(id) {
    override fun hashCode(): Int {
        return Objects.hashCode(code)
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false
        if (javaClass != other.javaClass) return false
        val otherAbstractCodeEntity = other as AbstractCodeEntity
        return Objects.equals(code, otherAbstractCodeEntity.code)
    }
}
