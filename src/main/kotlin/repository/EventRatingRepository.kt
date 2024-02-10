package community.flock.eco.workday.repository

import community.flock.eco.workday.model.EventRating
import community.flock.eco.workday.model.EventRatingId
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EventRatingRepository : PagingAndSortingRepository<EventRating, EventRatingId> {
    fun findByEventCode(eventCode: String): Iterable<EventRating>

    fun deleteByEventCode(code: String)

    fun deleteByEventCodeAndPersonUuid(
        eventCode: String,
        personUuid: UUID,
    )
}
