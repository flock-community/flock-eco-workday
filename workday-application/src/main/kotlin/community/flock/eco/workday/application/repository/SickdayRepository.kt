package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.SickDay
import community.flock.eco.workday.domain.common.Status
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
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
}
