package community.flock.eco.workday.controllers

import community.flock.eco.workday.model.Person
import community.flock.eco.workday.services.PersonService
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
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
@RequestMapping("api/person")
class PersonController(
    private val personService: PersonService
) {
    @GetMapping
    fun findAll(pageable: Pageable) = personService.findAll(pageable)

    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long) = personService.findById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No Person with given id: $id")

    @PostMapping
    fun post(@RequestBody person: Person) = personService.create(person)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "firstname & lastname are required")

    @PutMapping("/{id}")
    fun put(@PathVariable id: Long, @RequestBody updatedPerson: Person) = personService.update(id, updatedPerson)
            ?: throw ResponseStatusException(HttpStatus.BAD_REQUEST, "firstname & lastname are required")

    @DeleteMapping("/{id}")
    fun delete(@PathVariable id: Long) = personService.deleteById(id)
            ?: throw ResponseStatusException(HttpStatus.NOT_FOUND, "No Item to delete was found")
}
