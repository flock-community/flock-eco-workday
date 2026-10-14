package community.flock.eco.workday.application.config

import community.flock.eco.workday.user.filters.UserKeyTokenFilter
import community.flock.eco.workday.user.services.UserSecurityService
import jakarta.servlet.DispatcherType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.security.authentication.AbstractAuthenticationToken
import org.springframework.security.config.Customizer.withDefaults
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.security.web.savedrequest.HttpSessionRequestCache
import org.springframework.security.web.util.matcher.AndRequestMatcher
import org.springframework.security.web.util.matcher.AntPathRequestMatcher
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher
import org.springframework.security.web.util.matcher.NegatedRequestMatcher

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
class WebSecurityConfig {
    @Autowired
    lateinit var userSecurityService: UserSecurityService

    @Autowired
    lateinit var userKeyTokenFilter: UserKeyTokenFilter

    // Null when no issuer-uri is set (HydraIssuerConfigured), which disables the JWT chain.
    @Autowired(required = false)
    var hydraJwtAuthenticationConverter: Converter<Jwt, AbstractAuthenticationToken>? = null

    @Autowired(required = false)
    var hydraAuthenticationEntryPoint: AuthenticationEntryPoint? = null

    @Value("\${flock.eco.workday.login:TEST}")
    lateinit var loginType: String

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .addFilterBefore(userKeyTokenFilter, UsernamePasswordAuthenticationFilter::class.java)
            .headers { headers ->
                headers.frameOptions { it.sameOrigin() }
            }.csrf { it.disable() }

        hydraJwtAuthenticationConverter?.let { converter ->
            http.oauth2ResourceServer { rs ->
                rs.jwt { jwt -> jwt.jwtAuthenticationConverter(converter) }
                hydraAuthenticationEntryPoint?.let { rs.authenticationEntryPoint(it) }
            }
            // Bearer failures are answered 401/503 by the resource server's own filter above.
            // Keep the login redirect as the default entry point so unauthenticated web and
            // API-key requests still redirect as before, rather than the resource server's 401.
            http.exceptionHandling { it.authenticationEntryPoint(LoginUrlAuthenticationEntryPoint("/")) }
        }

        // Remember the page someone opened before logging in, such as a link to a CV, and
        // go there once they are logged in; the API and other non-page requests are not
        // remembered, so a background call never becomes the page to land on.
        http.requestCache { it.requestCache(pageRequestCache()) }

        http
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
                    defaultSuccessUrl("/")
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
                    defaultSuccessUrl("/")
                }

            else ->
                userSecurityService.testLogin(http) {
                    loginPage("/")
                    loginProcessingUrl("/login")
                    defaultSuccessUrl("/")
                }
        }

        return http.build()
    }

    private fun pageRequestCache() =
        HttpSessionRequestCache().apply {
            setRequestMatcher(
                AndRequestMatcher(
                    AntPathRequestMatcher("/**", HttpMethod.GET.name()),
                    NegatedRequestMatcher(AntPathRequestMatcher("/api/**")),
                    MediaTypeRequestMatcher(MediaType.TEXT_HTML).apply {
                        setIgnoredMediaTypes(setOf(MediaType.ALL))
                    },
                ),
            )
            // Keep the link as it was, without the `continue` parameter
            setMatchingRequestParameterName(null)
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
