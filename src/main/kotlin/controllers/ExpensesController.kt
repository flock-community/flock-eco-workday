package community.flock.eco.workday.controllers

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/expenses")
class ExpensesController() {

    @GetMapping("/")
    fun host(@RequestHeader host: String) = ResponseEntity
        .ok(host)
}
