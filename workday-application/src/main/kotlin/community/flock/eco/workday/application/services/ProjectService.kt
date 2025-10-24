package community.flock.eco.workday.application.services

import community.flock.eco.workday.application.forms.ProjectForm
import community.flock.eco.workday.application.model.Project
import community.flock.eco.workday.application.repository.ProjectRepository
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class ProjectService(private val projectRepository: ProjectRepository) {
    fun findAll(pageable: Pageable): Page<Project> = projectRepository.findAll(pageable)

    fun findByCode(code: String) = projectRepository.findByCode(code)

    @Transactional
    fun deleteByCode(code: String) = projectRepository.deleteByCode(code)

    @Transactional
    fun update(
        code: String,
        form: ProjectForm,
    ): Project =
        projectRepository
            .findByCode(code)
            .let { form.internalize(it) }
            .save()

    @Transactional
    fun create(form: ProjectForm): Project = form.internalize().save()

    fun ProjectForm.internalize(project: Project? = null) =
        Project(
            id = project?.id ?: 0,
            name = name,
        )

    // Why does this give a warning and the same thing on the Client doesn't?
    private fun Project.save() = projectRepository.save(this)
}
