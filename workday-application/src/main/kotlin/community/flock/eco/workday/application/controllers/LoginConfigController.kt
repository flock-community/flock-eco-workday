package community.flock.eco.workday.application.controllers

import community.flock.eco.workday.api.endpoint.GetLoginType
import community.flock.eco.workday.api.model.LoginType
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.RestController

@RestController
class LoginConfigController : GetLoginType.Handler {
    @Value("\${flock.eco.workday.login:TEST}")
    lateinit var loginType: String

    override suspend fun getLoginType(request: GetLoginType.Request): GetLoginType.Response<*> =
        GetLoginType.Response200(LoginType(type = loginType))
}
