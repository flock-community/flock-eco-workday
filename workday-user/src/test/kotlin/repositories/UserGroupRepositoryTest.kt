package community.flock.eco.feature.user.repositories

import community.flock.eco.feature.user.UserConfiguration
import community.flock.eco.feature.user.model.UserGroup
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.domain.Pageable
import javax.transaction.Transactional

@SpringBootTest(classes = [UserConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@Transactional
class UserGroupRepositoryTest(
    @Autowired private val usergroupRepository: UserGroupRepository,
) {
    @Test
    fun `save userGroup via repository`() {
        val userGroup =
            UserGroup(
                name = "group name",
            )

        usergroupRepository.save(userGroup)

        val res1 = usergroupRepository.findAllByNameIgnoreCaseContaining("GROUP NAME", Pageable.unpaged())
        assertEquals(1, res1.totalElements)
        assertEquals("group name", res1.content[0].name)
    }
}
