package community.flock.eco.workday.repository

import community.flock.eco.workday.model.Client
import community.flock.eco.workday.model.Workday
import org.springframework.data.repository.CrudRepository

interface WorkdayRepository : CrudRepository<Workday, Long> {
    fun findAllByClient(client: Client): Iterable<Workday>
}