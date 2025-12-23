package community.flock.eco.workday.user.services

import community.flock.eco.workday.user.forms.UserAccountOauthForm
import community.flock.eco.workday.user.forms.UserAccountPasswordForm
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountKey
import community.flock.eco.workday.user.model.UserAccountOauth
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import community.flock.eco.workday.user.model.UserAccountPassword
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OAuth2LoginConfigurer
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser

class UserSecurityService(
    private val userAccountService: UserAccountService,
) {
    class UserSecurityOauth2(
        val account: UserAccountOauth,
        token: OidcIdToken,
    ) : DefaultOidcUser(account.user.getGrantedAuthority(), token) {
        override fun getName(): String {
            return account.user.code
        }
    }

    class UserSecurityPassword(val account: UserAccountPassword) : UserDetails {
        override fun getAuthorities() = account.user.getGrantedAuthority()

        override fun isEnabled() = account.user.enabled

        override fun getUsername() = account.user.code

        override fun getPassword() = account.secret

        override fun isCredentialsNonExpired() = true

        override fun isAccountNonExpired() = true

        override fun isAccountNonLocked() = true
    }

    class UserSecurityKey(val account: UserAccountKey) : UserDetails {
        override fun getAuthorities() = account.user.getGrantedAuthority()

        override fun isEnabled() = account.user.enabled

        override fun getUsername() = account.user.code

        override fun getPassword() = null

        override fun isCredentialsNonExpired() = true

        override fun isAccountNonExpired() = true

        override fun isAccountNonLocked() = true
    }

    fun testLogin(
        http: HttpSecurity,
        block: FormLoginConfigurer<HttpSecurity>.() -> Unit,
    ): HttpSecurity {
        return http
            .userDetailsService { ref ->
                userAccountService.findUserAccountPasswordByUserEmail(ref)
                    ?.let { UserSecurityPassword(it) }
                    ?: userAccountService.createUserAccountPassword(
                        UserAccountPasswordForm(
                            email = ref,
                            password = ref,
                        ),
                    )
                        .let { UserSecurityPassword(it) }
            }
            .formLogin { it.block() }
    }

    fun databaseLogin(
        http: HttpSecurity,
        block: FormLoginConfigurer<HttpSecurity>.() -> Unit,
    ): HttpSecurity {
        return http
            .userDetailsService { ref ->
                userAccountService.findUserAccountPasswordByUserEmail(ref)
                    ?.let { UserSecurityPassword(it) }
                    ?: throw UsernameNotFoundException("User '$ref' not found")
            }
            .formLogin {
                it.block()
            }
    }

    fun googleLogin(
        http: HttpSecurity,
        block: OAuth2LoginConfigurer<HttpSecurity>.() -> Unit,
        block2: HttpSecurity.() -> Unit,
    ): HttpSecurity =
        http
            .oauth2Login({ login ->
                login
                    .userInfoEndpoint({ endpoint ->
                        endpoint
                            .oidcUserService { oidcUserRequest ->

                                val delegate = OidcUserService()
                                val oidcUser = delegate.loadUser(oidcUserRequest)

                                val reference = oidcUser.attributes["sub"].toString()
                                val name = oidcUser.attributes["name"].toString()
                                val email = oidcUser.attributes["email"].toString()

                                val form =
                                    UserAccountOauthForm(
                                        email = email,
                                        name = name,
                                        reference = reference,
                                        provider = UserAccountOauthProvider.GOOGLE,
                                    )

                                if (userAccountService.findUserAccountOauthByReference(reference) == null) {
                                    userAccountService.createUserAccountOauth(form)
                                }

                                userAccountService.findUserAccountOauthByReference(reference)
                                    ?.let { UserSecurityOauth2(it, oidcUser.idToken) }
                            }
                    })

                login.block()
            })
            .let {
                it.block2()
                it
            }
}

private fun User.getGrantedAuthority(): List<GrantedAuthority> {
    return this.authorities
        .map { SimpleGrantedAuthority(it) }
        .toList()
}
