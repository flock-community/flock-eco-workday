package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Logo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.util.UUID

@Repository
interface LogoRepository : JpaRepository<Logo, UUID> {
    fun findByNameIgnoreCase(name: String): Logo?

    /** The assignments that showed a logo show none once it is gone. */
    @Modifying
    @Query(value = """UPDATE "cv_experience" SET "logo_id" = NULL WHERE "logo_id" = :id""", nativeQuery = true)
    fun clearFromExperiences(
        @Param("id") id: UUID,
    ): Int
}
