package community.flock.eco.workday.application.common.properties

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "flock.eco.workday.calendar")
data class CalendarProperties(
    val token: String,
)
