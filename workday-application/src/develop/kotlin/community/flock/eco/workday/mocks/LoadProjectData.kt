package community.flock.eco.workday.mocks

import community.flock.eco.workday.application.model.Project
import community.flock.eco.workday.application.repository.ProjectRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadProjectData(
    val projectRepository: ProjectRepository,
    loadData: LoadData,
) {
    val projects: MutableMap<String, Project> = mutableMapOf()

    fun getProjectByName(name: String) =
        projects.computeIfAbsent(name) {
            Project(name = it).save()
        }

    init {
        loadData.loadWhenEmpty {
            Project(name = "Empty project").save()
        }
    }

    fun Project.save() = projectRepository.save(this)
}
