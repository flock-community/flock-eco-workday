package community.flock.eco.workday.application

import community.flock.eco.workday.application.config.WebMvcConfig
import community.flock.eco.workday.application.config.WebSecurityConfig
import community.flock.eco.workday.application.config.cloud.StubCloudConfiguration
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

@Configuration
@SpringBootApplication(
    exclude =
        [RepositoryRestMvcAutoConfiguration::class],
)
@Import(
    ApplicationConfiguration::class,
    WebMvcConfig::class,
    WebSecurityConfig::class,
    StubCloudConfiguration::class,
)
class Application : SpringBootServletInitializer()

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
