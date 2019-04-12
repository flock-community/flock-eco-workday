package community.flock.eco.holidays.controllers

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController


@RestController
@RequestMapping("/_ah")
class HealthController {

    @GetMapping("/health")
    fun health(): String {
        return "OK"
    }

}