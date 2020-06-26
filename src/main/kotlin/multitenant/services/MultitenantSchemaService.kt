package community.flock.eco.workday.multitenant.services

import liquibase.integration.spring.MultiTenantSpringLiquibase
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties
import org.springframework.jdbc.core.JdbcTemplate
import javax.sql.DataSource

class MultitenantSchemaService(
    private val dataSource: DataSource,
    private val jdbcTemplate: JdbcTemplate,
    private val liquibaseProperties: LiquibaseProperties
) {
    val prefix = "TENANT"

    private fun schemaName(name: String) = "${prefix}_$name"

    fun liquibase(schemas: List<String>): MultiTenantSpringLiquibase {
        val liquibase = MultiTenantSpringLiquibase()
        liquibase.changeLog = liquibaseProperties.changeLog
        liquibase.dataSource = dataSource
        liquibase.defaultSchema = "PUBLIC"
        liquibase.schemas = schemas
        return liquibase
    }

    fun createTenant(name: String) = jdbcTemplate
        .update("CREATE SCHEMA ${schemaName(name)}")
        .let {
            Tenant(
                name = name,
                schema = schemaName(name)
            )
        }

    fun deleteTenant(name: String) = jdbcTemplate
        .update("DROP SCHEMA ${schemaName(name)}")

    fun findAllTenant() = jdbcTemplate
        .queryForList("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA")
        .map { it["SCHEMA_NAME"] as String }
        .filter { it.startsWith("${prefix}_", true) }
        .map {
            Tenant(
                name = it.replace("${prefix}_", "", true),
                schema = it
            )
        }

}

data class Tenant(
    val name: String,
    val schema: String
)
