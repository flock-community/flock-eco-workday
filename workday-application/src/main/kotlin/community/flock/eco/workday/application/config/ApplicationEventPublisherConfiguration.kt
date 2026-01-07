package community.flock.eco.workday.application.config

import community.flock.eco.workday.domain.common.ApplicationEventPublisher
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.ApplicationEventPublisher as SpringApplicationEventPublisher

@Configuration
class ApplicationEventPublisherConfiguration {
    @Bean
    fun applicationEventPublisher(eventPublisher: SpringApplicationEventPublisher) =
        ApplicationEventPublisher { eventPublisher.publishEvent(it) }

}
