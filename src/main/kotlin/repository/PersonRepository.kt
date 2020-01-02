package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Person
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface PersonRepository : PagingAndSortingRepository<Person, Long> {
    fun findByCode(code: String): Person?
    fun findByUserCode(useCode: String): Person?
    fun existsByCode(code: String): Boolean
    fun deleteByCode(code: String): Unit
}
