package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.forms.PersonForm
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.PersonService
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ResponseStatusException

@RestController
@RequestMapping("/api/persons")
class PersonController(
    private val personService: PersonService
) {

    @GetMapping
    fun findAll(pageable: Pageable) = personService
            .findAll(pageable)
            .toResponse()

    @GetMapping("/{code}")
    fun findByCode(@PathVariable code: String): ResponseEntity<Person> = personService
            .findByCode(code)
            ?.toResponse()
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No Item found with this PersonCode")

    @PostMapping
    fun post(@RequestBody form: PersonForm) = personService.create(form)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "firstname & lastname are required")

    @PutMapping("/{code}")
    fun put(@PathVariable code: String, @RequestBody updatedPerson: Person) = personService
            .update(code, updatedPerson)
            .apply {
                when (this) {
                    is Person -> this.toResponse()
                    else -> throw ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Cannot perform PUT on given item. PersonCode cannot be found. Use POST Method"
                    )
                }
            }

    @DeleteMapping("/{code}")
    fun delete(@PathVariable code: String) = personService
            .deleteByCode(code)
            .toResponse()
            .apply {
                when (this.statusCodeValue) {
                    404 -> throw ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "No item found with this PersonCode. Has item already been deleted?"
                    )
                }
            }
}
