package community.flock.eco.workday.user.services

import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.forms.UserGroupForm
import community.flock.eco.workday.user.model.UserGroup
import community.flock.eco.workday.user.repositories.UserGroupRepository
import community.flock.eco.workday.user.repositories.UserRepository
import jakarta.transaction.Transactional
import org.springframework.stereotype.Service

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
