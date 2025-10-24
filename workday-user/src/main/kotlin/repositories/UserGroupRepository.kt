package community.flock.eco.feature.user.repositories

import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.model.UserGroup
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface UserGroupRepository : PagingAndSortingRepository<UserGroup, Long> {
    fun findAllByNameIgnoreCaseContaining(
        name: String,
        pageable: Pageable,
    ): Page<UserGroup>

    fun findAllByUsersContains(user: User): Iterable<UserGroup>

    fun findByCode(code: String): Optional<UserGroup>

    fun deleteByCode(code: String)
}
