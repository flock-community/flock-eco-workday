package community.flock.eco.workday.config

import community.flock.eco.feature.user.repositories.UserAccountPasswordRepository
import community.flock.eco.feature.user.services.UserAccountService
import community.flock.eco.feature.user.services.UserAuthorityService
import community.flock.eco.feature.user.services.UserSecurityService
import community.flock.eco.workday.authorities.LeaveDayAuthority
import community.flock.eco.workday.config.KratosIdentity.EmailAddress
import community.flock.eco.workday.config.KratosIdentity.UserId
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OAuth2LoginConfigurer
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.security.web.util.matcher.OrRequestMatcher
import org.springframework.security.web.util.matcher.RequestMatcher
import org.springframework.stereotype.Component
import java.io.IOException
import javax.servlet.Filter
import javax.servlet.FilterChain
import javax.servlet.ServletException
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@Component
class MyUserSecurityService(
    private val userSecurityService: UserSecurityService
) {
    fun googleLogin(http: HttpSecurity): OAuth2LoginConfigurer<HttpSecurity>.UserInfoEndpointConfig {
        return userSecurityService.googleLogin(http)
    }

    fun databaseLogin(http: HttpSecurity): FormLoginConfigurer<HttpSecurity> {
        return userSecurityService.databaseLogin(http)
    }

    fun kratosLogin(http: HttpSecurity): Unit {
//        var api = IdentityApi()

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
    lateinit var customTokenAuthenticationProvider: CustomTokenAuthenticationProvider

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
//            .csrf().disable()	//No CSRF token
            .formLogin().disable()    //No Form Login
            .logout().disable()    //No Logout
            .headers()
//            .frameOptions()
//            .sameOrigin()
        http
            .csrf().disable()
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
            .antMatchers("/h2/**").permitAll()
            .antMatchers("/api/events/**").permitAll()
            .antMatchers(*SWAGGER_WHITELIST).permitAll()
//            .antMatchers(*EXT_WHITELIST).permitAll()
            .anyRequest().authenticated()
        http
            .cors()
        http
            // No Session pls
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authenticationProvider(customTokenAuthenticationProvider)
            .addFilterBefore(getFilter(), AnonymousAuthenticationFilter::class.java) // Authorize

//                .addFilterBefore(GoogleTokenFilter(userAccountService), UsernamePasswordAuthenticationFilter::class.java)

//        when (loginType.toUpperCase()) {
//            "GOOGLE" ->
//                userSecurityService.googleLogin(http)
//                    .and()
//                    .defaultSuccessUrl("/", true)
//
//            "DATABASE" -> userSecurityService.databaseLogin(http).loginPage("/").loginProcessingUrl("/login")
//            else -> userSecurityService.testLogin(http).loginPage("/").loginProcessingUrl("/login")
//        }
    }

    private fun getRequestMatchers(): RequestMatcher? {
        return OrRequestMatcher(AntPathRequestMatcher("/**"))
    }

    @Throws(java.lang.Exception::class)
    private fun getFilter(): Filter {
        return CustomAuthenticationProcessingFilter(getRequestMatchers(), authenticationManager())
    }

    @Throws(Exception::class)
    override fun configure(auth: AuthenticationManagerBuilder) {
        auth.authenticationProvider(customTokenAuthenticationProvider)
    }
}


@Component
class CustomTokenAuthenticationProvider(
) : AuthenticationProvider {

    @Autowired
    lateinit var userAccountService: UserAccountService
    @Autowired
    lateinit var userAccountPasswordRepository: UserAccountPasswordRepository

    @Throws(AuthenticationException::class)
    override fun authenticate(authentication: Authentication): Authentication {
        val kratosIdentity = authentication.credentials as KratosIdentity?
        // Custom logic to validate the token
        // call auth service to check validity of token
        // keeping boolean flag for simplicity
        val account =
            kratosIdentity?.let {
                userAccountPasswordRepository.findAll().also { println(it) }
                userAccountService.findUserAccountPasswordByUserEmail(it.emailAddress.value)
            }
        return if (account != null) {
            val userSecurityPassword = UserSecurityService.UserSecurityPassword(account)
            PreAuthenticatedAuthenticationToken(
                userSecurityPassword.username,
                userSecurityPassword,
                userSecurityPassword.authorities
            )
        } else {
            PreAuthenticatedAuthenticationToken(
                kratosIdentity?.emailAddress ?: "anonymous",
                null
            )
        }

    }

    override fun supports(authentication: Class<*>): Boolean {
        // Lets use inbuilt token class for simplicity
        return PreAuthenticatedAuthenticationToken::class.java == authentication
    }
}

data class KratosIdentity(
    val userId: UserId,
    val emailAddress: EmailAddress

) {
    @JvmInline
    value class UserId(val value: String)

    @JvmInline
    value class EmailAddress(val value: String)
}

class CustomAuthenticationProcessingFilter(
    requiresAuthenticationRequestMatcher: RequestMatcher?,
    authenticationManager: AuthenticationManager?
) :
    AbstractAuthenticationProcessingFilter(requiresAuthenticationRequestMatcher) {
    init {
        //Set authentication manager
        setAuthenticationManager(authenticationManager)
    }

    @Throws(AuthenticationException::class, IOException::class, ServletException::class)
    override fun attemptAuthentication(request: HttpServletRequest, response: HttpServletResponse): Authentication {
        // Extract from request
        val xemail = request.getHeader("X-Email")
        val xuser = request.getHeader("X-User");
        val auth = if (xemail != null && xuser != null) KratosIdentity(UserId(xuser), EmailAddress(xemail)) else null
        // Create a token object ot pass to Authentication Provider
        val token = PreAuthenticatedAuthenticationToken(xemail ?: "anonymous", auth)
        return authenticationManager.authenticate(token)
    }

    @Throws(IOException::class, ServletException::class)
    override fun successfulAuthentication(
        request: HttpServletRequest, response: HttpServletResponse, chain: FilterChain,
        authResult: Authentication
    ) {
        // Save user principle in security context
        SecurityContextHolder.getContext().authentication = authResult
        chain.doFilter(request, response)
    }
}
