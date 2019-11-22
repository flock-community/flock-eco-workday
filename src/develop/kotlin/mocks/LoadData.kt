package community.flock.eco.workday.mocks

import community.flock.eco.workday.repository.DayRepository
import org.springframework.stereotype.Component

@Component
class LoadData(
    val dayRepository: DayRepository
)
