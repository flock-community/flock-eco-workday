package community.flock.eco.workday

import community.flock.eco.cloud.stub.StubCloudConfiguration
import community.flock.eco.workday.config.DatabaseConfig
import community.flock.eco.workday.config.WebMvcConfig
import community.flock.eco.workday.config.WebSecurityConfig
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import

@Configuration
@SpringBootApplication(exclude = arrayOf(
    RepositoryRestMvcAutoConfiguration::class
))
@Import(ApplicationConfiguration::class,
    WebMvcConfig::class,
    WebSecurityConfig::class,
    DatabaseConfig::class,
    StubCloudConfiguration::class)
class Application : SpringBootServletInitializer()

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}
