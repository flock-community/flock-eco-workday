package community.flock.eco.workday.user.develop.data

import community.flock.eco.workday.core.data.LoadData
import community.flock.eco.workday.user.model.UserGroup
import community.flock.eco.workday.user.repositories.UserGroupRepository
import org.springframework.stereotype.Component

@Component
class UserGroupLoadData(
    val userGroupRepository: UserGroupRepository,
) : LoadData<UserGroup> {
    override fun load(n: Int): Iterable<UserGroup> =
        (1..n)
            .map { user(it) }
            .also { userGroupRepository.saveAll(it) }

    private fun user(int: Int) =
        UserGroup(
            name = "name-$int",
        )
}
