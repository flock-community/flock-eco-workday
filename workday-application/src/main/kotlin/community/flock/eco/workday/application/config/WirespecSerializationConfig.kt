package community.flock.eco.workday.application.config

import com.fasterxml.jackson.databind.ObjectMapper
import community.flock.wirespec.integration.jackson.kotlin.WirespecSerialization
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary

/**
 * Overrides wirespec's default request/response serialization.
 *
 * wirespec 0.18's WirespecSerializationConfiguration builds its serializer from a fresh
 * `jacksonObjectMapper()`, which keeps Jackson's default FAIL_ON_UNKNOWN_PROPERTIES=true.
 * That rejects existing frontend payloads carrying fields absent from the .ws Form contracts
 * (e.g. server-generated `id`/`code` round-tripped on edit) with HTTP 500. 0.17.8 instead
 * injected Spring's auto-configured ObjectMapper, which is lenient.
 *
 * This bean restores that behavior by feeding Spring's ObjectMapper (lenient by default)
 * into wirespec's serializer. @Primary makes it win over the auto-imported strict bean.
 *
 * Enabled by default; set `workday.wirespec.lenient-deserialization=false` to fall back
 * to wirespec's strict serializer (useful for surfacing payloads that send fields absent
 * from their .ws contract).
 */
@Configuration
@ConditionalOnProperty(
    prefix = "workday.wirespec",
    name = ["lenient-deserialization"],
    havingValue = "true",
    matchIfMissing = true,
)
class WirespecSerializationConfig {
    // Distinct bean name avoids colliding with wirespec's own `wirespecSerialization`
    // bean; @Primary makes this the one that gets injected.
    @Bean
    @Primary
    fun lenientWirespecSerialization(objectMapper: ObjectMapper): WirespecSerialization =
        WirespecSerialization(objectMapper)
}
