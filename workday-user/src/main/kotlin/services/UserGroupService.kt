package community.flock.eco.feature.user.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.forms.UserGroupForm
import community.flock.eco.feature.user.model.UserGroup
import community.flock.eco.feature.user.repositories.UserGroupRepository
import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class UserGroupService(
    private val userRepository: UserRepository,
    private val userGroupRepository: UserGroupRepository,
) {
    fun findByCode(code: String) =
        userGroupRepository
            .findByCode(code)
            .toNullable()

    fun create(form: UserGroupForm): UserGroup =
        UserGroup(
            name = form.name ?: "",
            users =
                form.users
                    ?.let { it.internalizeUsers() }
                    ?: mutableSetOf(),
        )
            .let {
                userGroupRepository.save(it)
            }

    fun update(
        code: String,
        form: UserGroupForm,
    ): UserGroup? =
        findByCode(code)
            ?.let { userGroup ->
                userGroup.copy(
                    name = form.name ?: userGroup.name,
                    users =
                        form.users
                            ?.let { it.internalizeUsers() }
                            ?: userGroup.users,
                )
            }
            ?.let {
                userGroupRepository.save(it)
            }

    @Transactional
    fun delete(code: String) =
        userGroupRepository
            .deleteByCode(code)

    fun Set<String>.internalizeUsers() =
        userRepository
            .findAllByCodeIn(this)
            .toMutableSet()
}
