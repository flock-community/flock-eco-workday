package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Assignment
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface AssignmentRepository : PagingAndSortingRepository<Assignment, Long> {
    fun findByCode(code: String): Optional<Assignment>
    fun findAllByPersonUuid(personUuid: UUID): Iterable<Assignment>
    fun findAllByPersonUserCode(userCode: String): Iterable<Assignment>
    fun deleteByCode(code: String)
}
