package community.flock.eco.feature.user.services

import community.flock.eco.feature.user.forms.UserAccountOauthForm
import community.flock.eco.feature.user.forms.UserAccountPasswordForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserAccountKey
import community.flock.eco.feature.user.model.UserAccountOauth
import community.flock.eco.feature.user.model.UserAccountOauthProvider
import community.flock.eco.feature.user.model.UserAccountPassword
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configurers.FormLoginConfigurer
import org.springframework.security.config.annotation.web.configurers.oauth2.client.OAuth2LoginConfigurer
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService
import org.springframework.security.oauth2.core.oidc.OidcIdToken
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser

class UserSecurityService(
    private val userAccountService: UserAccountService,
    private val passwordEncoder: PasswordEncoder,
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

    fun testLogin(http: HttpSecurity): FormLoginConfigurer<HttpSecurity> {
        return http
            .userDetailsService { ref ->
                userAccountService.findUserAccountPasswordByUserEmail(ref)
                    ?.let { UserSecurityPassword(it) }
                    ?: userAccountService.createUserAccountPassword(UserAccountPasswordForm(email = ref, password = ref))
                        .let { UserSecurityPassword(it) }
            }
            .formLogin()
    }

    fun databaseLogin(http: HttpSecurity): FormLoginConfigurer<HttpSecurity> {
        return http
            .userDetailsService { ref ->
                userAccountService.findUserAccountPasswordByUserEmail(ref)
                    ?.let { UserSecurityPassword(it) }
                    ?: throw UsernameNotFoundException("User '$ref' not found")
            }
            .formLogin()
    }

    fun googleLogin(http: HttpSecurity): OAuth2LoginConfigurer<HttpSecurity>.UserInfoEndpointConfig {
        return http
            .oauth2Login()
            .userInfoEndpoint()
            .oidcUserService { it ->

                val delegate = OidcUserService()
                val oidcUser = delegate.loadUser(it)

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
    }
}

private fun User.getGrantedAuthority(): List<GrantedAuthority> {
    return this.authorities
        .map { SimpleGrantedAuthority(it) }
        .toList()
}
