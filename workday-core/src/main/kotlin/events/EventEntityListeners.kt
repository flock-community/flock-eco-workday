package community.flock.eco.core.events

import org.springframework.context.ApplicationEventPublisher
import javax.persistence.PostPersist
import javax.persistence.PostRemove
import javax.persistence.PostUpdate
import javax.persistence.PrePersist
import javax.persistence.PreRemove
import javax.persistence.PreUpdate

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
