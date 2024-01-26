package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Assignment
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.Optional
import java.util.UUID

@Repository
interface AssignmentRepository : PagingAndSortingRepository<Assignment, Long> {
    fun findByCode(code: String): Optional<Assignment>
    fun findAllByPersonUuid(personUuid: UUID, page: Pageable): Page<Assignment>
    fun findAllByPersonUserCode(userCode: String, page: Pageable): Page<Assignment>
    fun deleteByCode(code: String)
    fun findAllByToAfterOrToNull(to: LocalDate, page: Pageable): Page<Assignment>
    fun findByProjectCode(projectCode: String, page: Pageable): Page<Assignment>
}
