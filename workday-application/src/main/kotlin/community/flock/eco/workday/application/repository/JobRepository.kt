package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Job
import community.flock.eco.workday.application.model.JobStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface JobRepository : JpaRepository<Job, Long> {
    fun findByCode(code: String): Optional<Job>

    fun deleteByCode(code: String)

    fun findAllByStatus(
        status: JobStatus,
        pageable: Pageable,
    ): Page<Job>
}
