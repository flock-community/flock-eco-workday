package events

import community.flock.eco.core.events.Event

sealed class StorageEvent(open val entity: Any) : Event

data class PutObjectStorageEvent(override val entity: Any) : StorageEvent(entity)

data class PutChunkObjectStorageEvent(override val entity: Any) : StorageEvent(entity)

data class CompleteObjectStorageEvent(override val entity: Any) : StorageEvent(entity)
