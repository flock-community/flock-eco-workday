package community.flock.eco.workday.controllers

import community.flock.eco.workday.repository.WorkDayRepository
import community.flock.eco.workday.services.KetoService
import kotlinx.coroutines.runBlocking
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
    fun syncWorkday(): List<String> = runBlocking{
        ketoService.deleteAllWorkdayRelation()
        workDayRepository.findAll().map {
            ketoService.createWorkdayRelation(it.code, it.assignment.person.uuid.toString())
            it.code
        }
    }

}
