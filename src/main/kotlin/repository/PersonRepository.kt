package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Person
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface PersonRepository : PagingAndSortingRepository<Person, Long> {
    fun findByCode(code: String): Optional<Person>
    fun findByUserCode(useCode: String): Optional<Person>
    fun existsByCode(code: String): Boolean
    fun deleteByCode(code: String): Unit
    fun findByCodeIn(userCode: List<String>): Iterable<Person>
}
