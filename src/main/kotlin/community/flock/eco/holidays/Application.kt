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

@Component
class LoadData(
        val eventRepository: EventRepository
){

    init {
        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 7, 19, 0,0)
        ).save()

        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 7, 5, 0,0)
        ).save()

        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 6, 21, 0,0)
        ).save()

        Event(
                name = "Flock. day",
                type = EventType.FLOCK_DAY,
                date = LocalDateTime.of(2019, 6, 7, 0,0)
        ).save()
    }

    private fun Event.save() {
        eventRepository.save(this) //To change body of created functions use File | Settings | File Templates.
    }

}



