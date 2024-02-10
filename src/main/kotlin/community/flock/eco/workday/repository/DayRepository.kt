package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Day
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface DayRepository : PagingAndSortingRepository<Day, Long>
