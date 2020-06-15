package community.flock.eco.workday.mocks

import community.flock.eco.workday.repository.DayRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadData(
    val dayRepository: DayRepository
)
