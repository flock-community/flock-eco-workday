package community.flock.eco.workday.controllers

import community.flock.eco.workday.repository.WorkDayRepository
import community.flock.eco.workday.services.KetoService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/sync/keto")
class KetoController(
    private val workDayRepository: WorkDayRepository,
    private val ketoService: KetoService,
) {
    @GetMapping("/workday")
    suspend fun syncWorkday() = workDayRepository.findAll()
        .map {
            ketoService.createWorkdayRelation(it.code, it.assignment.person.uuid.toString())
        }

}
