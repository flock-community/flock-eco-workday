package community.flock.eco.workday.config

import liquibase.integration.spring.MultiTenantSpringLiquibase
import liquibase.pro.packaged.ds
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.DependsOn
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.datasource.DataSourceUtils
import org.springframework.jdbc.support.JdbcUtils
import java.sql.ResultSetMetaData
import javax.sql.DataSource


class DatabaseConfig {

    @Bean
    @DependsOn("liquibase")
    fun liquibaseMt(dataSource: DataSource, liquibaseProperties: LiquibaseProperties): MultiTenantSpringLiquibase? {

        val liquibase = MultiTenantSpringLiquibase()
        liquibase.dataSource = dataSource
        liquibase.defaultSchema = "public"
        liquibase.schemas = listOf(
            "a", "b", "c"
        )
        return liquibase
    }
}
