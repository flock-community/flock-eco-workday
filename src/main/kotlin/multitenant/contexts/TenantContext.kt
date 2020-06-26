package community.flock.eco.workday.multitenant.contexts

object TenantContext {
    private val currentTenant: ThreadLocal<String?> = InheritableThreadLocal()

    fun getCurrentTenant(): String? {
        return currentTenant.get()
    }

    fun setCurrentTenant(tenant: String?) {
        currentTenant.set(tenant)
    }

    fun clear() {
        currentTenant.set(null)
    }
}
