package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Project
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ProjectRepository : JpaRepository<Project, Long> {
    fun findByCode(code: String): Project?

    fun deleteByCode(code: String)
}
