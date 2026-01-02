package community.flock.eco.workday.user.services

import community.flock.eco.workday.core.utils.toNullable
import community.flock.eco.workday.user.UserConfiguration
import community.flock.eco.workday.user.forms.UserForm
import community.flock.eco.workday.user.forms.UserGroupForm
import community.flock.eco.workday.user.repositories.UserGroupRepository
import jakarta.transaction.Transactional
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [UserConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@Transactional
class UserGroupServiceTest(
    @Autowired private val userService: UserService,
    @Autowired private val userGroupService: UserGroupService,
    @Autowired private val userGroupRepository: UserGroupRepository,
) {
    @Test
    fun `create new group`() {
        val group = userGroupService.create(UserGroupForm("Test"))
        assertNotNull(group)
    }

    @Test
    fun `create new group with user`() {
        val form =
            UserForm(
                name = "User 2",
                email = "user-2@gmail.com",
            )
        val user = userService.create(form)
        val group = userGroupService.create(UserGroupForm("Test", mutableSetOf(user.code)))
        assertNotNull(group)
    }

    @Test
    fun `remove user from group`() {
        val form =
            UserForm(
                name = "User 3",
                email = "user-3@gmail.com",
            )
        val user = userService.create(form)
        assertNotNull(user.id)

        val group = userGroupService.create(UserGroupForm("Test", mutableSetOf(user.code)))
        assertNotNull(group.id)

        userGroupService.update(
            group.code,
            UserGroupForm(
                users = setOf(),
            ),
        )

        assertEquals(1, userService.findAll().count())
        assertEquals(1, userGroupRepository.findAll().count())
        assertEquals(
            0,
            userGroupRepository
                .findByCode(group.code)
                .toNullable()
                ?.users
                ?.count(),
        )
    }
}
