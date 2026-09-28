package community.flock.eco.workday.application.sickday.persistence

import community.flock.eco.workday.application.sickday.model.SickDay
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
interface SickdayRepository : JpaRepository<SickDay, Long> {
    fun findByCode(code: String): Optional<SickDay>

    fun deleteByCode(code: String)

    fun findAllByPersonUuid(personCode: UUID): Iterable<SickDay>

    fun findAllByPersonUuid(
        personCode: UUID,
        pageable: Pageable,
    ): Page<SickDay>

    fun findAllByPersonUserCode(
        userCode: String,
        pageable: Pageable,
    ): Page<SickDay>

    fun findAllByStatus(status: Status): Iterable<SickDay>

    @Query("SELECT s FROM SickDay s LEFT JOIN FETCH s.days WHERE s.from <= :to AND (s.to is null OR s.to >= :from)")
    fun findAllActive(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
    ): List<SickDay>

    @Query(
        "SELECT s FROM SickDay s LEFT JOIN FETCH s.days WHERE s.from <= :to AND (s.to is null OR s.to >= :from) AND s.person.uuid = :personCode",
    )
    fun findAllActiveByPerson(
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
        @Param("personCode") personCode: UUID,
    ): List<SickDay>
}
