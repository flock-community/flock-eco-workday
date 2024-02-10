package community.flock.eco.workday.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/_ah")
class AhController {
    @GetMapping("/start")
    fun start() =
        ResponseEntity
            .noContent()
            .build<Unit>()
}
