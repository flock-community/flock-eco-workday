package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Person
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional
import java.util.UUID

@Repository
interface PersonRepository : PagingAndSortingRepository<Person, Long> {
    fun findByUuid(uuid: UUID): Optional<Person>
    fun findByUserCode(userCode: String): Optional<Person>
    fun existsByUuid(uuid: UUID): Boolean
    fun deleteByUuid(uuid: UUID): Unit
    fun findByUuidIn(userUuid: List<UUID>): Iterable<Person>
    fun findAllByActive(pageable: Pageable, active: Boolean): Page<Person>
    fun findAllByFirstnameContainingIgnoreCase(pageable: Pageable, firstname: String): Page<Person>
}
