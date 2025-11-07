package community.flock.eco.workday.application.config.cloud

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

@Configuration
@EnableConfigurationProperties(StubCloudProperties::class)
@Import(StubMailService::class, StubStoreService::class)
class StubCloudConfiguration
