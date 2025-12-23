package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Assignment
import community.flock.eco.workday.application.model.Status
import community.flock.eco.workday.application.model.WorkDay
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface WorkDayRepository : JpaRepository<WorkDay, Long> {
    fun findByCode(code: String): Optional<WorkDay>

    fun deleteByCode(code: String)

    fun findAllByAssignmentPersonUuid(personCode: UUID): Iterable<WorkDay>

    fun findAllByAssignmentPersonUuid(
        personCode: UUID,
        pageable: Pageable,
    ): Page<WorkDay>

    fun findAllByAssignmentPersonUserCode(
        userCode: String,
        pageable: Pageable,
    ): Page<WorkDay>

    fun findAllByStatus(status: Status): Iterable<WorkDay>

    @Query(value = "SELECT COALESCE(SUM(w.hours), 0) FROM WorkDay w WHERE w.assignment = :assignment ")
    fun getTotalHoursByAssignment(
        @Param("assignment") assignment: Assignment,
    ): Int
}
