package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.EventDay
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface EventDayRepository : JpaRepository<EventDay, Long> {
    fun findAllByEventCode(eventCode: String): List<EventDay>

    fun deleteByEventCode(eventCode: String)

    fun deleteByEventCodeAndPersonUuid(
        eventCode: String,
        personUuid: UUID,
    )
}
