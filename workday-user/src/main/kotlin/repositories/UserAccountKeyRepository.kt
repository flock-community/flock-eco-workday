package community.flock.eco.feature.user.repositories

import community.flock.eco.feature.user.model.UserAccountKey
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserAccountKeyRepository : PagingAndSortingRepository<UserAccountKey, Long> {
    fun findByUserCode(code: String): Iterable<UserAccountKey>

    fun findByUserEmailIgnoreCaseContaining(email: String): Iterable<UserAccountKey>

    fun findByKey(key: String): Optional<UserAccountKey>
}
