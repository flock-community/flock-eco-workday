package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Period
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Repository

@Repository
interface PeriodRepository : CrudRepository<Period, Long>
