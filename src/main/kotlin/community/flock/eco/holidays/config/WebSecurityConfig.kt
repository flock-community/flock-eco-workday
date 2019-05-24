package community.flock.eco.fundraising.config

import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.holidays.authorities.HolidaysAuthority
import community.flock.eco.holidays.filters.GoogleTokenFilter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.core.env.Environment
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.core.userdetails.User as UserDetail


@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
class WebSecurityConfig : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var environment: Environment

    @Autowired
    lateinit var userAuthorityService: UserAuthorityService

    @Autowired
    lateinit var userSecurityService: UserSecurityService

    @Autowired
    lateinit var userRepository: UserRepository

    override fun configure(http: HttpSecurity) {

        userAuthorityService.addAuthority(HolidaysAuthority::class.java)

        http
                .csrf().disable()
        http
                .authorizeRequests()
                .antMatchers("/login").permitAll()
                .antMatchers("/_ah/**").permitAll()
                .anyRequest().authenticated()

        http
                .cors()

        http
                .addFilterBefore(GoogleTokenFilter(userRepository), UsernamePasswordAuthenticationFilter::class.java)

        userSecurityService.googleLogin(http)
    }
}

