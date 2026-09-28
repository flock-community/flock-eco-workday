package community.flock.eco.workday.application.event.persistence

import community.flock.eco.workday.application.event.model.Event
import jakarta.persistence.EntityManager

/**
 * Spring Data fragment of [EventRepository]: reloads an event after its event days changed,
 * so the returned entity reflects what was written in this transaction.
 */
interface EventRefreshRepository {
    fun refresh(event: Event): Event
}

class EventRefreshRepositoryImpl(
    private val entityManager: EntityManager,
) : EventRefreshRepository {
    override fun refresh(event: Event): Event =
        event.also {
            entityManager.flush()
            entityManager.refresh(it)
        }
}
