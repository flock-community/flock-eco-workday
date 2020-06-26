package community.flock.eco.multitenant

import community.flock.eco.workday.multitenant.filters.MultitenantFilter
import community.flock.eco.workday.multitenant.filters.MultitenantSchemaResolver
import community.flock.eco.workday.multitenant.filters.TenantConnectionProvider
import community.flock.eco.workday.multitenant.services.MultitenantSchemaService
import org.springframework.context.annotation.Import

@Import(
    MultitenantSchemaService::class,
    MultitenantFilter::class,
    MultitenantSchemaResolver::class,
    TenantConnectionProvider::class
    )
class MultitenantConfiguration
