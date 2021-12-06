package community.flock.eco.workday.config

import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.filters.GoogleTokenFilter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
class WebSecurityConfig : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var userAuthorityService: UserAuthorityService

    @Autowired
    lateinit var userSecurityService: UserSecurityService

    @Autowired
    lateinit var userAccountService: UserAccountService

    @Value("\${flock.eco.workday.login:TEST}")
    lateinit var loginType: String

    private val WHITELIST = arrayOf(
        "/swagger-ui/",
        "/swagger-resources",
        "/swagger-resources/**",
        "/v2/api-docs",
        "/favicon.ico",
        "/",
        "/*.js",
        "/tasks/**",
        "/actuator/**",
        "/login/**",
        "/h2/**",
        "/api/events/**"
    )

    override fun configure(http: HttpSecurity) {

        userAuthorityService.addAuthority(HolidayAuthority::class.java)

        http
            .headers()
            .frameOptions()
            .sameOrigin()
        http
            .csrf().disable()
        http
            .authorizeRequests()
            .antMatchers(*WHITELIST).permitAll()
            .anyRequest().authenticated()
        http
            .cors()
        http
            .addFilterBefore(GoogleTokenFilter(userAccountService), UsernamePasswordAuthenticationFilter::class.java)

        when (loginType.toUpperCase()) {
            "GOOGLE" ->
                userSecurityService.googleLogin(http)
                    .and()
                    .defaultSuccessUrl("/", true)
            "DATABASE" -> userSecurityService.databaseLogin(http)
            else -> userSecurityService.testLogin(http)
        }
    }
}
