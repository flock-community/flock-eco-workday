package community.flock.eco.workday.application.repository

import community.flock.eco.workday.application.model.Project
import org.springframework.data.repository.PagingAndSortingRepository
import org.springframework.stereotype.Repository

@Repository
interface ProjectRepository : PagingAndSortingRepository<Project, Long> {
    fun findByCode(code: String): Project?

    fun deleteByCode(code: String)
}
