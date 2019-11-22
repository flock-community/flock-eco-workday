package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.forms.ClientForm
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.services.ClientService
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/clients")
class ClientController(
    private val clientService: ClientService
) {

    @GetMapping
    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    fun findAll(pageable: Pageable): ResponseEntity<List<Client>> = clientService
            .findAll(pageable)
            .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    fun findByCode(@PathVariable code: String): ResponseEntity<Client> = clientService
                    .findByCode(code)
                    .toResponse()

    @PostMapping
    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    fun post(@RequestBody form: ClientForm): ResponseEntity<Client> = clientService
                    .create(form)
                    .toResponse()

    @PutMapping("{code}")
    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    fun put(@PathVariable code: String, @RequestBody form: ClientForm): ResponseEntity<Client> = clientService
                    .update(code, form)
                    .toResponse()

    @DeleteMapping("{code}")
    @PreAuthorize("hasAuthority('ClientAuthority.WRITE')")
    fun delete(@PathVariable code: String): ResponseEntity<Unit> = clientService
            .delete(code)
            .toResponse()
}
