package community.flock.eco.workday.multitenant.filters

import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import java.sql.Connection
import javax.sql.DataSource

@Component
class TenantConnectionProvider(
    private val dataSource: DataSource) : MultiTenantConnectionProvider {

    private val DEFAULT_TENANT = "PUBLIC"

    override fun getAnyConnection(): Connection {
        return dataSource.connection
    }

    override fun releaseAnyConnection(connection: Connection) {
        connection.close()
    }

    override fun getConnection(tenantIdentifier: String): Connection {
        logger.info("Get connection for tenant {}", tenantIdentifier)
        val connection: Connection = anyConnection
        connection.schema = tenantIdentifier
        return connection
    }

    override fun releaseConnection(tenantIdentifier: String?, connection: Connection) {
        logger.info("Release connection for tenant {}", tenantIdentifier)
        connection.schema = DEFAULT_TENANT
        releaseAnyConnection(connection)
    }

    override fun supportsAggressiveRelease(): Boolean {
        return false
    }

    override fun isUnwrappableAs(aClass: Class<*>?): Boolean {
        return false
    }

    override fun <T> unwrap(aClass: Class<T>): T? {
        return null
    }

    companion object {
        private val logger: Logger = LoggerFactory.getLogger(TenantConnectionProvider::class.java)
    }

}
