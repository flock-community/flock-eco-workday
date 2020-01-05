package community.flock.eco.workday.controllers

import community.flock.eco.workday.services.ClientService
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/test")
class TestController{

    @GetMapping("/host")
    fun host(@RequestHeader host:String ) = ResponseEntity
        .ok(host)
}
