package community.flock.eco.workday.application.controllers

import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/login")
class LoginConfigController {
    data class LoginType(
        val type: String,
    )

    @Value("\${flock.eco.workday.login:TEST}")
    lateinit var loginType: String

    @GetMapping("/type")
    fun getType() = LoginType(loginType)
}
