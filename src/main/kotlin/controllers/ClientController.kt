package community.flock.eco.workday.controllers;

import community.flock.eco.core.utils.toResponse
import community.flock.eco.workday.model.Client
import community.flock.eco.workday.repository.ClientRepository
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/clients")
class ClientController(
        private val clientRepository: ClientRepository) {

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    fun findByCode(@PathVariable code:String): ResponseEntity<Client> =
            clientRepository.findByCode(code)
                    .toResponse()

    @GetMapping
    @PreAuthorize("hasAuthority('ClientAuthority.READ')")
    fun findAll(pageable: Pageable): ResponseEntity<List<Client>> =
            clientRepository.findAll(pageable)
                    .toResponse()


}
