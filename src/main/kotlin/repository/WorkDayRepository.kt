package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Status
import community.flock.eco.workday.model.WorkDay
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface WorkDayRepository : PagingAndSortingRepository<WorkDay, Long> {
    fun findByCode(code: String): Optional<WorkDay>
    fun deleteByCode(code: String)
    fun findAllByAssignmentPersonUuid(personCode: UUID): Iterable<WorkDay>
    fun findAllByAssignmentPersonUuid(personCode: UUID, pageable: Pageable): Page<WorkDay>
    fun findAllByAssignmentPersonUserCode(userCode: String, pageable: Pageable): Page<WorkDay>
    fun findAllByStatus(status: Status): Iterable<WorkDay>
}
