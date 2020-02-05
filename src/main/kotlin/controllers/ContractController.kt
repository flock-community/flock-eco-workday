package community.flock.eco.workday.controllers

import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.services.UserService
import community.flock.eco.workday.authorities.AssignmentAuthority
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.services.ContractService
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/api/assignments")
class ContractController(
    private val userService: UserService,
    private val contractService: ContractService
) {

    @GetMapping(params = ["personCode"])
    @PreAuthorize("hasAuthority('HolidayAuthority.READ')")
    fun findAll(@RequestParam(required = false) personCode: String?, principal: Principal): ResponseEntity<Iterable<Contract>> =
        principal.findUser()
            ?.let { user ->
                if (user.isAdmin() && personCode != null) {
                    contractService.findAllByPersonCode(personCode)
                        .sortedBy { it.startDate }
                        .reversed()
                } else {
                    contractService.findAllByPersonUserCode(user.code)
                        .sortedBy { it.startDate }
                        .reversed()
                }
            }
            .toResponse()

    @GetMapping("/{code}")
    @PreAuthorize("hasAuthority('AssignmentAuthority.READ')")
    fun findByCode(@PathVariable code: String): ResponseEntity<Contract> = contractService
        .findByCode(code)
        .toResponse()

//    @PostMapping
//    @PreAuthorize("hasAuthority('AssignmentAuthority.WRITE')")
//    fun post(@RequestBody form: AssignmentForm, principal: Principal) = principal
//        .findUser()
//        ?.let { person ->
//            val personCode = when {
//                person.isAdmin() -> form.personCode
//                else -> person.code
//            }
//            form.copy(personCode = personCode)
//
//            return@let contractService.create(form)
//        }
//        ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)
//
//    @PutMapping("/{code}")
//    @PreAuthorize("hasAuthority('AssignmentAuthority.WRITE')")
//    fun put(
//        @PathVariable code: String,
//        @RequestBody form: AssignmentForm,
//        principal: Principal
//    ) = principal
//        .findUser()
//        ?.let {
//            contractService
//                .update(code, form)
//        }
//        .toResponse()
//
//    @DeleteMapping("/{code}")
//    @PreAuthorize("hasAuthority('AssignmentAuthority.ADMIN')")
//    fun delete(@PathVariable code: String, principal: Principal) =
//        principal
//            .findUser()
//            ?.let {
//                contractService
//                    .deleteByCode(code)
//                    .toResponse()
//            }
//            ?: throw ResponseStatusException(HttpStatus.UNAUTHORIZED)

    private fun Principal.findUser(): User? = userService
        .findByCode(this.name)

    private fun User.isAdmin(): Boolean = this
        .authorities
        .contains(AssignmentAuthority.ADMIN.toName())
}
