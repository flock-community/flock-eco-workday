package community.flock.eco.workday.repository

import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.Status
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface SickdayRepository : PagingAndSortingRepository<SickDay, Long> {
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
