package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.model.UserAccount
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface UserAccountRepository : PagingAndSortingRepository<UserAccount, Long> {
    fun findByUserCode(code: String): Iterable<UserAccount>

    fun deleteByUserCode(code: String): Unit
}
