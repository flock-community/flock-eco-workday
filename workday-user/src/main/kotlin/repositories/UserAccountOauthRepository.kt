package community.flock.eco.feature.user.repositories

import community.flock.eco.feature.user.model.UserAccountOauth
import community.flock.eco.feature.user.model.UserAccountOauthProvider
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserAccountOauthRepository : PagingAndSortingRepository<UserAccountOauth, Long> {
    fun findByReference(reference: String): Optional<UserAccountOauth>

    fun findByUserEmailIgnoreCaseContainingAndProvider(
        email: String,
        provider: UserAccountOauthProvider,
    ): Optional<UserAccountOauth>
}
