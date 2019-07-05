package community.flock.eco.holidays

import community.flock.eco.feature.gcp.mail.GcpMailConfiguration
import community.flock.eco.fundraising.config.WebMvcConfig
import community.flock.eco.fundraising.config.WebSecurityConfig
import community.flock.eco.holidays.model.Event
import community.flock.eco.holidays.model.EventType
import community.flock.eco.holidays.repository.EventRepository
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component
import java.time.LocalDateTime


@Configuration
@SpringBootApplication(exclude = arrayOf(
        RepositoryRestMvcAutoConfiguration::class
))
@Import(ApplicationConfiguration::class,
        WebMvcConfig::class,
        WebSecurityConfig::class,
        GcpMailConfiguration::class)
class Application : SpringBootServletInitializer()

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}



