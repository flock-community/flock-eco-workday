package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Person
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface PersonRepository : PagingAndSortingRepository<Person, Long> {
    fun findByUuid(uuid: UUID): Optional<Person>
    fun findByUserCode(userCode: String): Optional<Person>
    fun existsByUuid(uuid: String): Boolean
    fun deleteByUuid(uuid: String): Unit
    fun findByUuidIn(userUuid: List<UUID>): Iterable<Person>
}
