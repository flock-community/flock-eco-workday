package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.LeaveDay
import community.flock.eco.workday.application.model.LeaveDayType
import community.flock.eco.workday.application.model.Status
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface LeaveDayRepository : PagingAndSortingRepository<LeaveDay, Long> {
    fun findByCode(code: String): Optional<LeaveDay>

    fun findAllByPersonUuid(personCode: UUID): Iterable<LeaveDay>

    fun findAllByPersonUuid(
        personCode: UUID,
        pageable: Pageable,
    ): Page<LeaveDay>

    fun findAllByPersonUserCode(
        personCode: String,
        pageable: Pageable,
    ): Page<LeaveDay>

    fun findAllByStatus(status: Status): Iterable<LeaveDay>

    fun findAllByStatusAndType(
        status: Status,
        type: LeaveDayType,
    ): Iterable<LeaveDay>

    fun deleteByCode(code: String): Unit
}
