package community.flock.eco.workday.application.config

import community.flock.eco.workday.user.filters.UserKeyTokenFilter
import community.flock.eco.workday.user.services.UserSecurityService
import jakarta.servlet.DispatcherType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.Customizer.withDefaults
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
class WebSecurityConfig {
    @Autowired
    lateinit var userSecurityService: UserSecurityService

    @Autowired
    lateinit var userKeyTokenFilter: UserKeyTokenFilter

    @Value("\${flock.eco.workday.login:TEST}")
    lateinit var loginType: String

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .addFilterBefore(userKeyTokenFilter, UsernamePasswordAuthenticationFilter::class.java)
            .headers { headers ->
                headers.frameOptions { it.sameOrigin() }
            }.csrf { it.disable() }
            .cors(withDefaults())
            .authorizeHttpRequests { requests ->
                requests
                    // Permit FORWARD and ERROR dispatchers to prevent infinite redirects
                    .dispatcherTypeMatchers(DispatcherType.FORWARD, DispatcherType.ERROR)
                    .permitAll()
                    .requestMatchers("/favicon.ico")
                    .permitAll()
                    .requestMatchers("/site.webmanifest")
                    .permitAll()
                    .requestMatchers("/")
                    .permitAll()
                    .requestMatchers("/*.js")
                    .permitAll()
                    .requestMatchers("/images/*.webp")
                    .permitAll()
                    .requestMatchers("/images/*.svg")
                    .permitAll()
                    .requestMatchers("/assets/**")
                    .permitAll()
                    .requestMatchers("/tasks/**")
                    .permitAll()
                    .requestMatchers("/actuator/**")
                    .permitAll()
                    .requestMatchers("/login/**")
                    .permitAll()
                    .requestMatchers("/bootstrap")
                    .permitAll()
                    .requestMatchers("/h2/**")
                    .permitAll()
                    .requestMatchers("/api/events/**")
                    .permitAll()
                    .requestMatchers(*SWAGGER_WHITELIST)
                    .permitAll()
                    .requestMatchers(*EXT_WHITELIST)
                    .permitAll()
                    .anyRequest()
                    .authenticated()
            }

        when (loginType.uppercase()) {
            "GOOGLE" ->
                userSecurityService.googleLogin(http, {
                    defaultSuccessUrl("/", true)
                }) {
                    logout { logout ->
                        logout.logoutSuccessUrl("/")
                        logout.logoutUrl("/logout")
                    }
                }

            "DATABASE" ->
                userSecurityService.databaseLogin(http) {
                    loginPage("/")
                    loginProcessingUrl("/login")
                    defaultSuccessUrl("/", true)
                }

            else ->
                userSecurityService.testLogin(http) {
                    loginPage("/")
                    loginProcessingUrl("/login")
                    defaultSuccessUrl("/", true)
                }
        }

        return http.build()
    }

    companion object {
        private val SWAGGER_WHITELIST =
            arrayOf(
                "/swagger-ui/",
                "/swagger-resources",
                "/swagger-resources/**",
                "/v2/api-docs",
            )

        private val EXT_WHITELIST =
            arrayOf(
                "/api/ext/calendar/**",
            )
    }
}
