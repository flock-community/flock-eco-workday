package community.flock.eco.workday.controllers

import community.flock.eco.workday.multitenant.services.MultitenantSchemaService
import liquibase.integration.spring.MultiTenantSpringLiquibase
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/tenant")
class TenantController(
    private val multiTenantSpringLiquibase: MultiTenantSpringLiquibase,
    private val multitenantSchemaService: MultitenantSchemaService) {

    @GetMapping
    fun new() {
        val tenantName = "test"

        val exists = multitenantSchemaService.findAllTenant()
            .any { it.name.toUpperCase() == tenantName.toUpperCase() }

        if (!exists) {
            val tenant = multitenantSchemaService.createTenant(tenantName);
            val schemas = (multiTenantSpringLiquibase.schemas + tenant.schema).toSet()
            multiTenantSpringLiquibase.schemas = schemas.toList()
            multiTenantSpringLiquibase.afterPropertiesSet()
        } else {
            throw error("Tenant already exists")
        }
    }
}
