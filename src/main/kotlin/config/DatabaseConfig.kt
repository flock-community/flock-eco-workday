package community.flock.eco.workday.config

import community.flock.eco.workday.multitenant.filters.MultitenantFilter
import community.flock.eco.workday.multitenant.services.MultitenantSchemaService
import liquibase.integration.spring.MultiTenantSpringLiquibase
import org.hibernate.MultiTenancyStrategy
import org.hibernate.cfg.Environment
import org.hibernate.context.spi.CurrentTenantIdentifierResolver
import org.hibernate.engine.jdbc.connections.spi.MultiTenantConnectionProvider
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.liquibase.LiquibaseProperties
import org.springframework.boot.autoconfigure.orm.jpa.JpaProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.DependsOn
import org.springframework.orm.jpa.JpaVendorAdapter
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.util.HashMap
import javax.sql.DataSource


class DatabaseConfig : WebMvcConfigurer {

    @Autowired
    lateinit var multitenantFilter: MultitenantFilter

    @Autowired
    lateinit var jpaProperties: JpaProperties


    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(multitenantFilter)
    }

    @Bean
    @DependsOn("liquibase")
    fun liquibaseMt(
        dataSource: DataSource,
        multitenantSchemaService: MultitenantSchemaService,
        liquibaseProperties: LiquibaseProperties): MultiTenantSpringLiquibase {

        multitenantSchemaService.createTenant("a")
        multitenantSchemaService.createTenant("b")
        multitenantSchemaService.createTenant("c")

        val schemas = multitenantSchemaService
            .findAllTenant()
            .map { it.schema }
        return multitenantSchemaService.liquibase(schemas)
    }

//    @Bean
//    fun entityManagerFactory(
//        dataSource: DataSource?,
//        multiTenantConnectionProvider: MultiTenantConnectionProvider,
//        currentTenantIdentifierResolver: CurrentTenantIdentifierResolver
//    ): LocalContainerEntityManagerFactoryBean? {
//        val jpaPropertiesMap: HashMap<String, Any> = HashMap(jpaProperties.properties)
//        jpaPropertiesMap[Environment.MULTI_TENANT] = MultiTenancyStrategy.SCHEMA
//        jpaPropertiesMap[Environment.MULTI_TENANT_CONNECTION_PROVIDER] = multiTenantConnectionProvider
//        jpaPropertiesMap[Environment.MULTI_TENANT_IDENTIFIER_RESOLVER] = currentTenantIdentifierResolver
//
//        val em = LocalContainerEntityManagerFactoryBean()
//        em.dataSource = dataSource
//        em.setPackagesToScan("*")
//        em.jpaVendorAdapter = HibernateJpaVendorAdapter()
//        em.jpaPropertyMap = jpaPropertiesMap
//        return em
//    }
}
