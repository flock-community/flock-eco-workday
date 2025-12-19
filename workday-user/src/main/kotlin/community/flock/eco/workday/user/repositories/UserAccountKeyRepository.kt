package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.model.UserAccountKey
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserAccountKeyRepository : JpaRepository<UserAccountKey, Long> {
    fun findByUserCode(code: String): Iterable<UserAccountKey>

    fun findByUserEmailIgnoreCaseContaining(email: String): Iterable<UserAccountKey>

    fun findByKey(key: String): Optional<UserAccountKey>
}
