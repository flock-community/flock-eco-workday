package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.model.Person
import community.flock.eco.workday.repository.PersonRepository
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
        private val personRepository: PersonRepository,
        private val personService: PersonService) {

    @GetMapping
    fun findAll(pageable: Pageable) = personService
            .findAll(pageable)
            .toResponse()

    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long): ResponseEntity<Person> = personService
            .findById(id)
            .toResponse()
            .also {
                when (it.statusCodeValue) {
                    404 -> throw ResponseStatusException(HttpStatus.NOT_FOUND, "No Item found with this id")
                    else -> it
                }
            }

    @PostMapping
    fun post(@RequestBody person: Person) = personService.create(person)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "firstname & lastname are required")

    @PutMapping("/{id}")
    fun put(@PathVariable id: Long, @RequestBody updatedPerson: Person) = personService
            .update(id, updatedPerson)
            .apply {
                when (this) {
                    is Person -> this.toResponse()
                    else -> throw ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Cannot perform PUT on given item. Id cannot be found. Use POST Method"
                    )
                }
            }

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = personService
            .deleteById(id)
            .toResponse()
            .apply {
                when (this.statusCodeValue) {
                    404 -> throw ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "No item found with this id. Has item already been deleted?"
                    )
                }
            }
}
