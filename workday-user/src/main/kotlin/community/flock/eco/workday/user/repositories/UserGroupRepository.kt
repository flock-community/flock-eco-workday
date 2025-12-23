package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserGroup
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserGroupRepository : JpaRepository<UserGroup, Long> {
    fun findAllByNameIgnoreCaseContaining(
        name: String,
        pageable: Pageable,
    ): Page<UserGroup>

    fun findAllByUsersContains(user: User): Iterable<UserGroup>

    fun findByCode(code: String): Optional<UserGroup>

    fun deleteByCode(code: String)
}
