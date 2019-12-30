package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.authorities.SickdayAuthority
import community.flock.eco.workday.forms.SickdayForm
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.model.SickdayStatus
import community.flock.eco.workday.services.PersonService
import community.flock.eco.workday.services.SickdayService
import java.security.Principal
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
    private val service: SickdayService,
    private val personService: PersonService
) {
    @GetMapping
    fun getAll(
        @RequestParam(required = false) status: SickdayStatus?,
        @RequestParam(required = false) code: String?
    ) = service
        .findAll(status, code)
        .toResponse()

    @GetMapping("/{code}")
    fun findByCode(@PathVariable code: String) = service.findByCode(code).toResponse()

    @PostMapping
    fun post(@RequestBody form: SickdayForm) = service.create(form).toResponse()

    @PutMapping("/{code}")
    fun put(@PathVariable code: String, @RequestBody form: SickdayForm) = service
        .update(code, form)
        .toResponse()

    @DeleteMapping("/{code}")
    fun delete(@PathVariable code: String) = service.delete(code).toResponse()

    // *-- utility functions --*
    /**
     * add findPerson() function to Principal
     * @return <code>Person?</code> if a person can be found with given user code in the db
     */
    private fun Principal.findPerson(): Person? = personService.findByUserCode(this.name)

    /**
     * Evaluate if user has admin authorities on Sickday
     * @return <code>true</code> if user is admin or has admin authorities
     */
    private fun Person.isAdmin(): Boolean = this.user?.authorities?.contains(SickdayAuthority.ADMIN.toName()) ?: false

    /**
     * Evaluate if user has no admin authorities on Sickday
     * @return <code>true</code> if user is not admin or has admin authorities
     */
    private fun Person.isNotAdmin(): Boolean = !this.isAdmin()
}
