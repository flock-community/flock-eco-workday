package community.flock.eco.workday.config

import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.workday.authorities.LeaveDayAuthority
import community.flock.eco.workday.config.KratosIdentity.EmailAddress
import community.flock.eco.workday.config.KratosIdentity.UserId
import community.flock.eco.workday.authentication.OathkeeperProxyAuthenticationProcessingFilter
import community.flock.eco.workday.authentication.OathkeeperProxyAuthenticationProvider
import community.flock.eco.workday.authentication.RedirectLogoutHandler
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OAuth2LoginConfigurer
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.security.web.util.matcher.NegatedRequestMatcher
import org.springframework.stereotype.Component


@Component
class MyUserSecurityService(
    private val userSecurityService: UserSecurityService,
    private val oathkeeperProxyAuthenticationProvider:OathkeeperProxyAuthenticationProvider
) {
    fun googleLogin(http: HttpSecurity): OAuth2LoginConfigurer<HttpSecurity>.UserInfoEndpointConfig {
        return userSecurityService.googleLogin(http)
    }

    fun databaseLogin(http: HttpSecurity): FormLoginConfigurer<HttpSecurity> {
        return userSecurityService.databaseLogin(http)
    }

    fun kratosLogin(http: HttpSecurity, authenticationManager: AuthenticationManager): Unit {
        http
            .httpBasic().disable()    //No Http Basic Login
            .formLogin().disable()    //No Form Login
            .logout()
            .addLogoutHandler(RedirectLogoutHandler()) //No Logout
        // No Session pls
        http
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authenticationProvider(oathkeeperProxyAuthenticationProvider)
            .addFilterBefore(
                OathkeeperProxyAuthenticationProcessingFilter(
                    NegatedRequestMatcher(AntPathRequestMatcher("/error")),
                    authenticationManager
                ), AnonymousAuthenticationFilter::class.java
            )

    }

    fun testLogin(http: HttpSecurity): FormLoginConfigurer<HttpSecurity> {
        return userSecurityService.testLogin(http);
    }


}

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
class WebSecurityConfig : WebSecurityConfigurerAdapter() {

    @Autowired
    lateinit var userAuthorityService: UserAuthorityService

    @Autowired
    lateinit var userSecurityService: MyUserSecurityService

    @Autowired
    lateinit var userAccountService: UserAccountService

    @Autowired
    lateinit var oathkeeperProxyAuthenticationProvider: OathkeeperProxyAuthenticationProvider

    @Value("\${flock.eco.workday.login:TEST}")
    lateinit var loginType: String

    private val SWAGGER_WHITELIST = arrayOf(
        "/swagger-ui/",
        "/swagger-resources",
        "/swagger-resources/**",
        "/v2/api-docs"
    )

    private val EXT_WHITELIST = arrayOf(
        "/api/ext/calendar/**"
    )

    override fun configure(http: HttpSecurity) {
        userAuthorityService.addAuthority(LeaveDayAuthority::class.java)
        http
            .httpBasic().disable()    //No Http Basic Login
            .formLogin().disable()    //No Form Login
            .logout()
            .addLogoutHandler(RedirectLogoutHandler()) //No Logout
            .and()
            .headers()
            .frameOptions()
            .sameOrigin()
        http
            .csrf().disable() // TODO: don't disable csrf, but implement it in the frontend
        // Authorizations
        http
            .authorizeRequests()
            .antMatchers("/favicon.ico").permitAll()
            .antMatchers("/").permitAll()
            .antMatchers("/*.js").permitAll()
            .antMatchers("/images/*.webp").permitAll()
            .antMatchers("/images/*.svg").permitAll()
            .antMatchers("/tasks/**").permitAll()
            .antMatchers("/actuator/**").permitAll()
            .antMatchers("/login/**").permitAll()
            .antMatchers("/bootstrap").permitAll()
            .antMatchers("/error").permitAll()
            .antMatchers("/h2/**").permitAll()
            .antMatchers("/api/events/**").permitAll()
            .antMatchers(*SWAGGER_WHITELIST).permitAll()
            .antMatchers(*EXT_WHITELIST).permitAll()
            .anyRequest().authenticated()
        http
            .cors()
        http
            // No Session pls
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authenticationProvider(oathkeeperProxyAuthenticationProvider)
            .addFilterBefore(
                OathkeeperProxyAuthenticationProcessingFilter(
                    NegatedRequestMatcher(AntPathRequestMatcher("/error")),
                    authenticationManager()
                ), AnonymousAuthenticationFilter::class.java
            )
    }
}

