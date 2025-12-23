package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.model.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserRepository : JpaRepository<User, Long> {
    fun findAllByCodeIn(codes: Set<String>): Iterable<User>

    fun findAllByNameIgnoreCaseContainingOrEmailIgnoreCaseContaining(
        name: String,
        email: String,
        pageable: Pageable,
    ): Page<User>

    fun findByCode(code: String): Optional<User>

    fun findByEmail(email: String): Optional<User>

    fun findByEmailIgnoreCase(email: String): Optional<User>

    fun deleteByCode(code: String)
}
