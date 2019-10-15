package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Day
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import org.springframework.stereotype.Service

@Repository
interface DayRepository : PagingAndSortingRepository<Day, Long>
