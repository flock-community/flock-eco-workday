package community.flock.eco.workday.core.model

import jakarta.persistence.Column
import jakarta.persistence.MappedSuperclass
import java.util.Objects
import java.util.UUID

@MappedSuperclass
abstract class AbstractCodeEntity(
    id: Long = 0,
    @Column(unique = true)
    open val code: String = UUID.randomUUID().toString(),
) : AbstractIdEntity(id) {
    override fun hashCode(): Int = Objects.hashCode(code)

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null) return false
        if (javaClass != other.javaClass) return false
        val otherAbstractCodeEntity = other as AbstractCodeEntity
        return Objects.equals(code, otherAbstractCodeEntity.code)
    }
}
