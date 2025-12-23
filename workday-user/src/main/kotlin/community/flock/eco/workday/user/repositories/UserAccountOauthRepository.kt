package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.model.UserAccountOauth
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserAccountOauthRepository :
    JpaRepository<UserAccountOauth, Long> {
    fun findByReference(reference: String): Optional<UserAccountOauth>

    fun findByUserEmailIgnoreCaseContainingAndProvider(
        email: String,
        provider: UserAccountOauthProvider,
    ): Optional<UserAccountOauth>
}
