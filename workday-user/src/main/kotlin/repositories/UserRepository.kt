package community.flock.eco.feature.user.repositories

import community.flock.eco.feature.user.model.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserRepository : PagingAndSortingRepository<User, Long> {
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
