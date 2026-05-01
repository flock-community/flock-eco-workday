package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.DeleteProject
import community.flock.eco.workday.api.endpoint.GetProjectAll
import community.flock.eco.workday.api.endpoint.GetProjectByCode
import community.flock.eco.workday.api.endpoint.PostProject
import community.flock.eco.workday.api.endpoint.PutProject
import community.flock.eco.workday.application.forms.ProjectForm
import community.flock.eco.workday.application.services.ProjectService
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.RestController
import community.flock.eco.workday.api.model.Project as ProjectApi
import community.flock.eco.workday.api.model.ProjectForm as ProjectFormApi
import community.flock.eco.workday.application.model.Project as ProjectInternal

@RestController
class ProjectController(
    private val projectService: ProjectService,
) : GetProjectAll.Handler,
    GetProjectByCode.Handler,
    PostProject.Handler,
    PutProject.Handler,
    DeleteProject.Handler {
    @PreAuthorize("hasAuthority('ProjectAuthority.READ')")
    override suspend fun getProjectAll(request: GetProjectAll.Request): GetProjectAll.Response<*> {
        val page = PageRequest.of(
            request.queries.page ?: 0,
            request.queries.size ?: 20,
            request.queries.sort?.toSort() ?: Sort.unsorted(),
        )
        return GetProjectAll.Response200(
            projectService
                .findAll(page)
                .content
                .map { it.externalize() },
        )
    }

    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    override suspend fun getProjectByCode(request: GetProjectByCode.Request): GetProjectByCode.Response<*> {
        val project =
            projectService.findByCode(request.path.code)
                ?: error("Project with code ${request.path.code} not found")
        return GetProjectByCode.Response200(project.externalize())
    }

    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    override suspend fun postProject(request: PostProject.Request): PostProject.Response<*> {
        val project = projectService.create(request.body.internalize())
        return PostProject.Response200(project.externalize())
    }

    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    override suspend fun putProject(request: PutProject.Request): PutProject.Response<*> {
        val project = projectService.update(request.path.code, request.body.internalize())
        return PutProject.Response200(project.externalize())
    }

    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    override suspend fun deleteProject(request: DeleteProject.Request): DeleteProject.Response<*> {
        projectService.deleteByCode(request.path.code)
        return DeleteProject.Response200(Unit)
    }

    private fun ProjectInternal.externalize() =
        ProjectApi(
            id = id,
            code = code,
            name = name,
        )

    private fun ProjectFormApi.internalize() =
        ProjectForm(
            name = name ?: "",
        )

    private fun String.toSort(): Sort =
        split(",")
            .map { it.trim() }
            .filter { it.isNotEmpty() }
            .let { parts ->
                when {
                    parts.isEmpty() -> Sort.unsorted()
                    parts.size == 1 -> Sort.by(parts[0])
                    parts.last().equals("asc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.ASC, *parts.dropLast(1).toTypedArray())
                    parts.last().equals("desc", ignoreCase = true) ->
                        Sort.by(Sort.Direction.DESC, *parts.dropLast(1).toTypedArray())
                    else -> Sort.by(*parts.toTypedArray())
                }
            }
}
