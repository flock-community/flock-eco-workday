package community.flock.eco.feature.user.services

import community.flock.eco.core.utils.toNullable
import community.flock.eco.feature.user.events.UserCreateEvent
import community.flock.eco.feature.user.events.UserUpdateEvent
import community.flock.eco.feature.user.forms.UserForm
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserAccountRepository
import community.flock.eco.feature.user.repositories.UserGroupRepository
import community.flock.eco.feature.user.repositories.UserRepository
import org.springframework.context.ApplicationEventPublisher
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class UserService(
    val userRepository: UserRepository,
    val userGroupRepository: UserGroupRepository,
    val userAccountRepository: UserAccountRepository,
    val applicationEventPublisher: ApplicationEventPublisher,
) {
    fun count() = userRepository.count()

    fun findAll(): Iterable<User> = userRepository.findAll()

    fun findAll(
        name: String,
        email: String,
        pageable: Pageable,
    ): Iterable<User> =
        userRepository.findAllByNameIgnoreCaseContainingOrEmailIgnoreCaseContaining(
            name,
            email,
            pageable,
        )

    fun findByCode(code: String): User? =
        userRepository
            .findByCode(code)
            .toNullable()

    fun create(form: UserForm): User =
        form
            .toUser()
            .let { userRepository.save(it) }
            .also { applicationEventPublisher.publishEvent(UserCreateEvent(it)) }

    fun read(code: String): User? =
        userRepository
            .findByCode(code)
            .toNullable()

    fun update(
        code: String,
        form: UserForm,
    ): User? =
        read(code)
            ?.let { it.merge(form) }
            ?.let { userRepository.save(it) }
            ?.also { applicationEventPublisher.publishEvent(UserUpdateEvent(it)) }

    @Transactional
    fun delete(code: String) =
        read(code)?.run {
            userGroupRepository.findAllByUsersContains(this)
                .map { group ->
                    group.copy(
                        users =
                            group.users
                                .filter { it.code != code }
                                .toMutableSet(),
                    )
                }
                .let { userGroupRepository.saveAll(it) }
            userAccountRepository.deleteByUserCode(code)
            userRepository.deleteByCode(code)
        }

    fun searchByNameOrEmail(
        name: String,
        email: String,
        pageable: Pageable,
    ) = userRepository
        .findAllByNameIgnoreCaseContainingOrEmailIgnoreCaseContaining(name, email, pageable)

    fun findByEmail(email: String) = userRepository.findByEmailIgnoreCase(email).toNullable()

    private fun UserForm.toUser() =
        User(
            name = this.name,
            email = this.email,
            authorities = this.authorities,
        )

    private fun User.merge(form: UserForm) =
        this.copy(
            name = form.name,
            email = form.email,
            authorities = form.authorities,
        )
}
