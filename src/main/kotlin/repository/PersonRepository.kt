package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Person
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface PersonRepository : PagingAndSortingRepository<Person, Long>
