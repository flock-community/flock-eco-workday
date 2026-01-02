package community.flock.eco.workday.application.config

import org.springdoc.core.models.GroupedOpenApi
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {
    @Bean
    fun api(): GroupedOpenApi =
        GroupedOpenApi
            .builder()
            .group("flock-eco-workday-public")
            .packagesToScan("community.flock.eco.workday")
            .build()
}
