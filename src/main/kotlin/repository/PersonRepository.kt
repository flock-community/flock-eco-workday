package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Person
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.*

@Repository
interface PersonRepository : PagingAndSortingRepository<Person, Long> {
    fun findByUuid(uuid: UUID): Optional<Person>
    fun findByUserCode(userCode: String): Optional<Person>
    fun findAllByUpdates(updates: Boolean): List<Person>
    fun existsByUuid(uuid: UUID): Boolean
    fun deleteByUuid(uuid: UUID): Unit
    fun findByUuidIn(userUuid: List<UUID>): Iterable<Person>
}
