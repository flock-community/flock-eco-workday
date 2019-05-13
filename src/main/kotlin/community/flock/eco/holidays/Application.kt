package community.flock.eco.holidays

import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.fundraising.config.WebMvcConfig
import community.flock.eco.fundraising.config.WebSecurityConfig
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.data.rest.RepositoryRestMvcAutoConfiguration
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component


@Configuration
@SpringBootApplication(exclude = arrayOf(
        RepositoryRestMvcAutoConfiguration::class,
        UserDetailsServiceAutoConfiguration::class
))
@Import(ApplicationConfiguration::class,
        WebMvcConfig::class,
        WebSecurityConfig::class)
class Application : SpringBootServletInitializer()

fun main(args: Array<String>) {
    SpringApplication.run(Application::class.java, *args)
}


@Component
class UploadData(private val userRepository: UserRepository, passwordEncoder: PasswordEncoder) {

    init {
        userRepository
                .findByReference("user")
                .orElseGet {
                    User(
                            reference = "user",
                            email = "user",
                            name = "user",
                            secret = passwordEncoder.encode("user"),
                            authorities = setOf()
                    ).let { userRepository.save(it) }
                }


    }
}



