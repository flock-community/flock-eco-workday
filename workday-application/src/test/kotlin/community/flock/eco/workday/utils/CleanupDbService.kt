package community.flock.eco.workday.utils

import org.slf4j.LoggerFactory
import java.sql.Connection
import java.sql.Statement
import javax.sql.DataSource

private const val H2_DB_PRODUCT_NAME: String = "H2"
private const val H2_SCHEMA_NAME: String = "PUBLIC"

open class CleanupDbService(
    private val dataSource: DataSource,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    open fun cleanup() {
        dataSource.connection.use { connection ->
            connection.autoCommit = false
            try {
                connection.createStatement().use { statement ->
                    if (isH2Database(connection)) {
                        try {
                            disableConstraints(statement)
                            truncateTables(statement, H2_SCHEMA_NAME)
                            resetSequences(statement, H2_SCHEMA_NAME)
                        } finally {
                            enableConstraints(statement)
                        }
                    } else {
                        log.warn("Skipping cleaning up database, because it's not H2 database")
                    }
                }
                connection.commit()
            } catch (e: Exception) {
                connection.rollback()
                throw e
            }
        }
    }

    private fun resetSequences(
        statement: Statement,
        schemaName: String,
    ) {
        getSchemaSequences(statement, schemaName)
            .forEach({ sequenceName ->
                executeStatement(
                    statement,
                    "ALTER SEQUENCE \"$sequenceName\" RESTART WITH 1",
                )
            })
    }

    private fun truncateTables(
        statement: Statement,
        schemaName: String,
    ) {
        getSchemaTables(statement, schemaName)
            .forEach({ tableName -> executeStatement(statement, "TRUNCATE TABLE \"$schemaName\".\"$tableName\"") })
    }

    private fun enableConstraints(statement: Statement) {
        executeStatement(statement, "SET REFERENTIAL_INTEGRITY TRUE")
    }

    private fun disableConstraints(statement: Statement) {
        executeStatement(statement, "SET REFERENTIAL_INTEGRITY FALSE")
    }

    private fun isH2Database(connection: Connection): Boolean = H2_DB_PRODUCT_NAME == connection.metaData.databaseProductName

    private fun executeStatement(
        statement: Statement,
        sql: String?,
    ) {
        statement.executeUpdate(sql)
    }

    private fun getSchemaTables(
        statement: Statement,
        schemaName: String,
    ): Set<String?> {
        val sql = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES  where TABLE_SCHEMA='$schemaName'"
        return queryForList(statement, sql)
    }

    private fun getSchemaSequences(
        statement: Statement,
        schemaName: String,
    ): Set<String?> {
        val sql = "SELECT SEQUENCE_NAME FROM INFORMATION_SCHEMA.SEQUENCES WHERE SEQUENCE_SCHEMA='$schemaName'"
        return queryForList(statement, sql)
    }

    private fun queryForList(
        statement: Statement,
        sql: String,
    ): Set<String?> {
        val tables: MutableSet<String?> = HashSet<String?>()
        statement.executeQuery(sql).use { rs ->
            while (rs.next()) {
                tables.add(rs.getString(1))
            }
        }
        return tables
    }
}
