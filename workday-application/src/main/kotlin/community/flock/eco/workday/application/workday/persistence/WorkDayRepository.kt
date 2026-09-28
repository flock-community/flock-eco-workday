package community.flock.eco.workday.application.workday.persistence

import community.flock.eco.workday.application.assignment.model.Assignment
import community.flock.eco.workday.application.workday.model.WorkDay
import community.flock.eco.workday.domain.common.Status
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate
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

    @Query("SELECT it FROM WorkDay it LEFT JOIN FETCH it.days WHERE it.from <= :to AND (it.to is null OR it.to >= :from)")
    fun findAllActive(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
    ): List<WorkDay>

    @Query(
        "SELECT it FROM WorkDay it LEFT JOIN FETCH it.days WHERE it.from <= :to AND (it.to is null OR it.to >= :from) AND it.assignment.person.uuid = :personCode",
    )
    fun findAllActiveByPerson(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
        @Param("personCode") personCode: UUID,
    ): List<WorkDay>
}
