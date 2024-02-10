package community.flock.eco.workday.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties(prefix = "flock.eco.workday.calendar")
data class CalendarProperties(
    val token: String,
)
