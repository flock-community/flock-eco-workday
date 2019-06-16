package community.flock.eco.holidays.repository

import community.flock.eco.feature.user.model.User
import community.flock.eco.holidays.model.Event
import community.flock.eco.holidays.model.Holiday
import org.springframework.data.repository.CrudRepository
import org.springframework.stereotype.Service

@Service
interface EventRepository : CrudRepository<Event, Long>
