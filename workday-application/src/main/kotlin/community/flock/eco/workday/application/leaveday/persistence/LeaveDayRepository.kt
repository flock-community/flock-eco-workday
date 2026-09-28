package community.flock.eco.workday.application.leaveday.persistence

import community.flock.eco.workday.application.leaveday.model.LeaveDay
import community.flock.eco.workday.application.leaveday.model.LeaveDayType
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
interface LeaveDayRepository : JpaRepository<LeaveDay, Long> {
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

    fun findAllByStatusInAndType(
        statuses: Collection<Status>,
        type: LeaveDayType,
    ): Iterable<LeaveDay>

    fun deleteByCode(code: String): Unit

    @Query("SELECT h FROM LeaveDay h LEFT JOIN FETCH h.days WHERE h.from <= :to AND (h.to is null OR h.to >= :from)")
    fun findAllActive(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
    ): List<LeaveDay>

    @Query(
        "SELECT h FROM LeaveDay h LEFT JOIN FETCH h.days WHERE h.from <= :to AND (h.to is null OR h.to >= :from) AND h.person.uuid = :personCode",
    )
    fun findAllActiveByPerson(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
        @Param("personCode") personCode: UUID,
    ): List<LeaveDay>
}
