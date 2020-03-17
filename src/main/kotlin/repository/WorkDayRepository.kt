package community.flock.eco.workday.repository

import community.flock.eco.workday.model.WorkDay
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface WorkDayRepository : CrudRepository<WorkDay, Long> {
    fun findByCode(code: String): Optional<WorkDay>
    fun deleteByCode(code: String)
    fun findAllByAssignmentPersonCode(personCode: String): Iterable<WorkDay>
    fun findAllByAssignmentPersonUserCode(userCode: String): Iterable<WorkDay>
}
