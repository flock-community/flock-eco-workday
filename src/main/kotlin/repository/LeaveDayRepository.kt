package community.flock.eco.workday.repository

import community.flock.eco.workday.model.HoliDay
import community.flock.eco.workday.model.HolidayType
import community.flock.eco.workday.model.Status
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface LeaveDayRepository : PagingAndSortingRepository<HoliDay, Long> {
    fun findByCode(code: String): Optional<HoliDay>
    fun findAllByPersonUuid(personCode: UUID): Iterable<HoliDay>
    fun findAllByPersonUuid(personCode: UUID, pageable: Pageable): Page<HoliDay>
    fun findAllByPersonUserCode(personCode: String, pageable: Pageable): Page<HoliDay>
    fun findAllByStatus(status: Status): Iterable<HoliDay>
    fun findAllByStatusAndType(status: Status, type: HolidayType): Iterable<HoliDay>
    fun deleteByCode(code: String): Unit
}
