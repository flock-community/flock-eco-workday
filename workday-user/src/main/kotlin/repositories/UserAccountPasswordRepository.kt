package community.flock.eco.feature.user.repositories

import community.flock.eco.feature.user.model.UserAccountPassword
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserAccountPasswordRepository : PagingAndSortingRepository<UserAccountPassword, Long> {
    fun findByUserEmailIgnoreCase(email: String): Optional<UserAccountPassword>

    fun findByUserCode(code: String): Optional<UserAccountPassword>

    fun findByUserEmail(code: String): Optional<UserAccountPassword>

    fun findByResetCode(code: String): Optional<UserAccountPassword>
}
