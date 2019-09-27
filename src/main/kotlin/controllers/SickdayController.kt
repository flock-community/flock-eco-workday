package community.flock.eco.workday.controllers;

import community.flock.eco.core.utils.toNullable
import community.flock.eco.core.utils.toResponse
import community.flock.eco.feature.user.model.User
import community.flock.eco.feature.user.repositories.UserRepository
import community.flock.eco.workday.authorities.HolidayAuthority
import community.flock.eco.workday.forms.HolidayForm
import community.flock.eco.workday.model.Period
import community.flock.eco.workday.repository.PeriodRepository
import community.flock.eco.workday.services.PeriodService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@RequestMapping("/api/sickdays")
class SickdayController(
        private val userRepository: UserRepository,
        private val periodRepository: PeriodRepository,
        private val periodService: PeriodService) {

    @GetMapping
    @PreAuthorize("hasAuthority('SickdayAuthority.READ')")
    fun findAll(@RequestParam(required = false) userCode: String?, principal: Principal): ResponseEntity<Iterable<Period>> {

        return principal.findUser()
                ?.let { user ->
                    if (user.isAdmin() && userCode != null) {
                        periodRepository.findAllByUserCode(userCode)
                    } else {
                        periodRepository.findAllByUserCode(user.code)
                    }

                }.toResponse()
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    fun post(@RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Period> {
        return principal
                .findUser()
                ?.let {
                    if (!it.isAuthorizedForUserCode(form.userCode)) {
                        form.copy(userCode = it.code)
                    } else {
                        form.copy(userCode = form.userCode ?: it.code)
                    }
                }
                ?.let {
                    periodService.create(it)
                }
                .toResponse()
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    fun put(@PathVariable id: Long, @RequestBody form: HolidayForm, principal: Principal): ResponseEntity<Any> {
        return principal
                .findUser()
                ?.let {
                    if (it.isAuthorizedForHoliday(id)) {
                        periodService.update(id, form)
                    } else {
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    }
                }
                .toResponse()
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SickdayAuthority.WRITE')")
    fun delete(@PathVariable id: Long, principal: Principal): ResponseEntity<Any> {
        return principal
                .findUser()
                ?.let {
                    if (it.isAuthorizedForHoliday(id)) {
                        periodService.delete(id)
                    } else {
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    }

                }
                .toResponse()
    }

    private fun Principal.findUser(): User? = userRepository
            .findByCode(this.name)
            .toNullable()

    private fun User.isAdmin(): Boolean = this.authorities
            .contains(HolidayAuthority.ADMIN.toName())

    private fun User.isAuthorizedForUserCode(userCode: String?): Boolean = this.isAdmin() || this.code.equals(userCode)

    private fun User.isAuthorizedForHoliday(id: Long): Boolean = this.isAdmin() || this.equals(periodRepository.findById(id).get().user)

}
