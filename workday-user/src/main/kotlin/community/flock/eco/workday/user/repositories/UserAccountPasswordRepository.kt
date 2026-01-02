package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.model.UserAccountPassword
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserAccountPasswordRepository : JpaRepository<UserAccountPassword, Long> {
    fun findByUserEmailIgnoreCase(email: String): Optional<UserAccountPassword>

    fun findByUserCode(code: String): Optional<UserAccountPassword>

    fun findByUserEmail(code: String): Optional<UserAccountPassword>

    fun findByResetCode(code: String): Optional<UserAccountPassword>
}
