package community.flock.eco.workday.exactonline.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties(prefix = "flock.eco.feature.exactonline")
data class ExactonlineProperties(
    val requestUri: String = "https://start.exactonline.nl",
    var clientId: String? = null,
    var clientSecret: String? = null,
    var redirectUri: String? = null,
)
