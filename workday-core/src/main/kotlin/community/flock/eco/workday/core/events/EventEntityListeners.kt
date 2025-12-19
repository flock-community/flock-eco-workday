package community.flock.eco.workday.core.events

import jakarta.persistence.PostPersist
import jakarta.persistence.PostRemove
import jakarta.persistence.PostUpdate
import jakarta.persistence.PrePersist
import jakarta.persistence.PreRemove
import jakarta.persistence.PreUpdate
import org.springframework.context.ApplicationEventPublisher

sealed class EntityEvent(open val entity: Any) : Event

data class PrePersistEntityEvent(override val entity: Any) : EntityEvent(entity)

data class PreUpdateEntityEvent(override val entity: Any) : EntityEvent(entity)

data class PreRemoveEntityEvent(override val entity: Any) : EntityEvent(entity)

data class PostPersistEntityEvent(override val entity: Any) : EntityEvent(entity)

data class PostUpdateEntityEvent(override val entity: Any) : EntityEvent(entity)

data class PostRemoveEntityEvent(override val entity: Any) : EntityEvent(entity)

class EventEntityListeners(
    private val publisher: ApplicationEventPublisher,
) {
    @PrePersist
    private fun prePersist(entity: Any) =
        publisher
            .publishEvent(PrePersistEntityEvent(entity))

    @PreUpdate
    private fun preUpdate(entity: Any) =
        publisher
            .publishEvent(PreUpdateEntityEvent(entity))

    @PreRemove
    private fun preRemove(entity: Any) =
        publisher
            .publishEvent(PreRemoveEntityEvent(entity))

    @PostPersist
    private fun postPersist(entity: Any) =
        publisher
            .publishEvent(PostPersistEntityEvent(entity))

    @PostUpdate
    private fun postUpdate(entity: Any) =
        publisher
            .publishEvent(PostUpdateEntityEvent(entity))

    @PostRemove
    private fun postRemove(entity: Any) =
        publisher
            .publishEvent(PostRemoveEntityEvent(entity))
}
