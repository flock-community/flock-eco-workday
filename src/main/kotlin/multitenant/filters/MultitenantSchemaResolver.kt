package community.flock.eco.workday.multitenant.filters

import community.flock.eco.workday.multitenant.contexts.TenantContext.getCurrentTenant
import org.hibernate.context.spi.CurrentTenantIdentifierResolver
import org.springframework.stereotype.Component


@Component
class MultitenantSchemaResolver : CurrentTenantIdentifierResolver {
    private val defaultTenant = "PUBLIC"
    override fun resolveCurrentTenantIdentifier(): String {
        return getCurrentTenant() ?: defaultTenant
    }

    override fun validateExistingCurrentSessions(): Boolean {
        return true
    }
}
