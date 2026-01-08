package community.flock.eco.workday.core.events

import community.flock.eco.workday.domain.common.Event

sealed class StorageEvent(
    open val entity: Any,
) : Event

data class PutObjectStorageEvent(
    override val entity: Any,
) : StorageEvent(entity)

data class PutChunkObjectStorageEvent(
    override val entity: Any,
) : StorageEvent(entity)

data class CompleteObjectStorageEvent(
    override val entity: Any,
) : StorageEvent(entity)
