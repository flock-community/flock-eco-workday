package community.flock.eco.workday.user.repositories

import community.flock.eco.workday.user.UserConfiguration
import community.flock.eco.workday.user.model.User
import community.flock.eco.workday.user.model.UserAccountOauth
import community.flock.eco.workday.user.model.UserAccountOauthProvider
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.assertj.core.api.Assertions.assertThat
import org.assertj.core.api.Assertions.assertThatThrownBy
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa
import org.springframework.boot.test.context.SpringBootTest

@SpringBootTest(classes = [UserConfiguration::class])
@AutoConfigureTestDatabase
@AutoConfigureDataJpa
@Transactional
class UserAccountOrphanPurgeTest(
    @Autowired private val userRepository: UserRepository,
    @Autowired private val userAccountOauthRepository: UserAccountOauthRepository,
    @Autowired private val entityManager: EntityManager,
) {
    // Logically identical to flock-eco-feature-user-003-purge-orphan-user-accounts.yaml; identifiers are
    // quoted here only because the Hibernate-created test schema stores them case-sensitively under
    // globally_quoted_identifiers (the migration runs unquoted, like changeset 002, against Postgres).
    private val purgeOrphans =
        """
        DELETE FROM "user_account"
        WHERE NOT EXISTS (SELECT 1 FROM "user_account_oauth" o WHERE o."id" = "user_account"."id")
          AND NOT EXISTS (SELECT 1 FROM "user_account_password" p WHERE p."id" = "user_account"."id")
          AND NOT EXISTS (SELECT 1 FROM "user_account_key" k WHERE k."id" = "user_account"."id")
        """.trimIndent()

    @Test
    fun `an orphaned user_account base row 500s every read of the owning user`() {
        val user = orphanedAccountOwner()

        // User.accounts is an EAGER, JOINED-polymorphic @OneToMany: loading the user force-initialises it,
        // and the orphan base row has no subclass row, so Hibernate cannot resolve a concrete persister.
        assertThatThrownBy { userRepository.findById(user.id).orElseThrow().accounts.size }
            .isInstanceOf(RuntimeException::class.java)
    }

    @Test
    fun `purging the orphaned base row restores polymorphic account loading`() {
        val user = orphanedAccountOwner()

        entityManager.createNativeQuery(purgeOrphans).executeUpdate()
        entityManager.flush()
        entityManager.clear()

        val reloaded = userRepository.findById(user.id).orElseThrow()
        assertThat(reloaded.accounts).hasSize(1) // the surviving (non-orphaned) coupling
        val orphanRows =
            entityManager
                .createNativeQuery("""SELECT count(*) FROM "user_account" WHERE "id" = :id""")
                .setParameter("id", orphanId)
                .singleResult as Number
        assertThat(orphanRows.toInt()).isZero()
    }

    private var orphanId: Long = 0

    // Seeds a user with one valid KRATOS coupling and one coupling we orphan exactly the way
    // flock-eco-feature-user-002 did: delete the user_account_oauth subclass row, keep its user_account base row.
    private fun orphanedAccountOwner(): User {
        val user = userRepository.save(User(name = "Pim", email = "pim@flock.community"))
        userAccountOauthRepository.saveAndFlush(
            UserAccountOauth(user = user, reference = "keep", provider = UserAccountOauthProvider.KRATOS),
        )
        val orphan =
            userAccountOauthRepository.saveAndFlush(
                UserAccountOauth(user = user, reference = "stray", provider = UserAccountOauthProvider.GOOGLE),
            )
        orphanId = orphan.id
        entityManager
            .createNativeQuery("""DELETE FROM "user_account_oauth" WHERE "id" = :id""")
            .setParameter("id", orphan.id)
            .executeUpdate()
        entityManager.flush()
        entityManager.clear()
        return user
    }
}
