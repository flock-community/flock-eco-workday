package community.flock.eco.workday.config

import com.fasterxml.jackson.databind.Module
import community.flock.wirespec.integration.jackson.WirespecModule
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class WirespecConfiguration {
    @Bean
    fun wirespecModule(): Module = WirespecModule()
}
