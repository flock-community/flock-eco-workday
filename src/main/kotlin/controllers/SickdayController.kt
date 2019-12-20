package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.filters.SickdayFilters
import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.services.SickdayService
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/sickdays")
class SickdayController(
    private val service: SickdayService
) {
    @GetMapping
    fun getAll(@RequestParam status: SickdayFilters?, @RequestParam code: Int?) = service
        .findAll(status, code)
        .toResponse()

    @PostMapping
    fun post(@RequestBody form: SickdayForm) = service.create(form).toResponse()

    @PutMapping("/{code}")
    fun put(@PathVariable code: String, @RequestBody form: SickdayForm) = service
        .update(code, form)
        .toResponse()

    @DeleteMapping("/{code}")
    fun delete(@PathVariable code: String) = service.delete(code).toResponse()
}
