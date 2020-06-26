package community.flock.eco.workday.multitenant.filters

import community.flock.eco.workday.multitenant.contexts.TenantContext
import org.springframework.stereotype.Component
import org.springframework.web.servlet.ModelAndView
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse


@Component
class MultitenantFilter : HandlerInterceptorAdapter() {

    override fun preHandle(request: HttpServletRequest,
                           response: HttpServletResponse, `object`: Any): Boolean {
        println("In preHandle we are Intercepting the Request")
        val tenantID = request.getParameter("tenant")
        TenantContext.setCurrentTenant(tenantID)
        return true
    }

    override fun postHandle(
        request: HttpServletRequest, response: HttpServletResponse, handler: Any, modelAndView: ModelAndView) {
        TenantContext.clear()
    }
}
