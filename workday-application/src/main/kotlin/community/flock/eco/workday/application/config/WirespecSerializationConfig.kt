package community.flock.eco.workday.application.config

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.wirespec.integration.jackson.kotlin.WirespecSerialization
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary

@Configuration
@ConditionalOnProperty(
    prefix = "workday.wirespec",
    name = ["lenient-deserialization"],
    havingValue = "true",
    matchIfMissing = true,
)
class WirespecSerializationConfig {
    @Bean
    @Primary
    fun lenientWirespecSerialization(objectMapper: ObjectMapper): WirespecSerialization =
        WirespecSerialization(objectMapper)
}
