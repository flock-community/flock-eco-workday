package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.authorities.ContractAuthority
import community.flock.eco.workday.forms.ContractExternalForm
import community.flock.eco.workday.forms.ContractInternalForm
import community.flock.eco.workday.forms.ContractManagementForm
import community.flock.eco.workday.forms.ContractServiceForm
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.services.ContractService
import org.springframework.data.domain.Pageable
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api")
class ContractController(
    private val userService: UserService,
    private val contractService: ContractService
) {

    @GetMapping("/contracts")
    @PreAuthorize("hasAuthority('ContractAuthority.ADMIN')")
    fun findAll(page: Pageable): ResponseEntity<List<Contract>> = contractService
        .findAll(page)
        .sortedBy { it.to }
        .toResponse()

    @GetMapping("/contracts", params = ["start", "end"])
    @PreAuthorize("hasAuthority('ContractAuthority.ADMIN')")
    fun findAllByToBetween(
        page: Pageable,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) start: LocalDate?,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) end: LocalDate?
    ): ResponseEntity<List<Contract>> = contractService
        .findAllByToBetween(start, end)
        .sortedByDescending { it.to }
        .toResponse()

    @GetMapping("/contracts", params = ["personId"])
    @PreAuthorize("hasAuthority('ContractAuthority.READ')")
    fun findAllByPersonCode(@RequestParam(required = false) personId: UUID?, principal: Principal): ResponseEntity<Iterable<Contract>> =
        principal.findUser()
            ?.let { user ->
                if (user.isAdmin() && personId != null) {
                    contractService.findAllByPersonUuid(personId)
                        .sortedBy { it.from }
                        .reversed()
                } else {
                    contractService.findAllByPersonUserCode(user.code)
                        .sortedBy { it.from }
                        .reversed()
                }
            }
            .toResponse()

    @GetMapping("/contracts/{code}")
    @PreAuthorize("hasAuthority('ContractAuthority.READ')")
    fun findByCode(@PathVariable code: String): ResponseEntity<Contract> = contractService
        .findByCode(code)
        .toResponse()

    @PostMapping("/contracts-internal")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun postInternal(@RequestBody form: ContractInternalForm, principal: Principal) = principal
        .findUser()
        ?.let { person ->
            val personCode = when {
                person.isAdmin() -> form.personId
                else -> UUID.fromString(person.code)
            }
            contractService.create(form.copy(personId = personCode))
        }
        .toResponse()

    @PostMapping("/contracts-external")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun postExternal(@RequestBody form: ContractExternalForm) = contractService
        .create(form)
        .toResponse()

    @PostMapping("/contracts-management")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun postManagement(@RequestBody form: ContractManagementForm) = contractService
        .create(form)
        .toResponse()

    @PostMapping("/contracts-service")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun postService(@RequestBody form: ContractServiceForm) = contractService
        .create(form)
        .toResponse()

    @PutMapping("/contracts-internal/{code}")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun putInternal(
        @PathVariable code: String,
        @RequestBody form: ContractInternalForm,
        principal: Principal
    ) = contractService
        .update(code, form)
        .toResponse()

    @PutMapping("/contracts-external/{code}")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun putExternal(
        @PathVariable code: String,
        @RequestBody form: ContractExternalForm,
        principal: Principal
    ) = contractService
        .update(code, form)
        .toResponse()

    @PutMapping("/contracts-management/{code}")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun putManagement(
        @PathVariable code: String,
        @RequestBody form: ContractManagementForm,
        principal: Principal
    ) = contractService
        .update(code, form)
        .toResponse()

    @PutMapping("/contracts-service/{code}")
    @PreAuthorize("hasAuthority('ContractAuthority.WRITE')")
    fun putService(
        @PathVariable code: String,
        @RequestBody form: ContractServiceForm,
        principal: Principal
    ) = contractService
        .update(code, form)
        .toResponse()

    @DeleteMapping("/contracts/{code}")
    @PreAuthorize("hasAuthority('ContractAuthority.ADMIN')")
    fun delete(@PathVariable code: String, principal: Principal) = contractService
        .deleteByCode(code)
        .toResponse()
        .toResponse()

    private fun Principal.findUser(): User? = userService
        .findByCode(this.name)

    private fun User.isAdmin(): Boolean = this
        .authorities
        .contains(ContractAuthority.ADMIN.toName())
}
