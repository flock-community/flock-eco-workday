package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.application.forms.ProjectForm
import community.flock.eco.workday.application.services.ProjectService
import community.flock.eco.workday.core.utils.toResponse
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("api/projects")
class ProjectController(
    private val projectService: ProjectService,
) {
    @GetMapping
    @PreAuthorize("hasAuthority('ProjectAuthority.READ')")
    fun findAll(pageable: Pageable) = projectService.findAll(pageable).toResponse()

    @GetMapping("{code}")
    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    fun findByCode(
        @PathVariable code: String,
    ) = projectService.findByCode(code).toResponse()

    @DeleteMapping("{code}")
    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    fun delete(
        @PathVariable code: String,
    ) = projectService.deleteByCode(code).toResponse()

    @PutMapping("{code}")
    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    fun update(
        @PathVariable code: String,
        @RequestBody form: ProjectForm,
    ) = projectService.update(code, form).toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('ProjectAuthority.WRITE')")
    fun create(
        @RequestBody form: ProjectForm,
    ) = projectService.create(form)
}
