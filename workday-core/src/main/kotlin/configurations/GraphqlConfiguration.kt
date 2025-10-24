package community.flock.eco.core.configurations

import graphql.scalars.ExtendedScalars
import graphql.schema.GraphQLScalarType
import org.springframework.context.annotation.Bean

class GraphqlConfiguration() {
    @Bean
    fun dateScalarType(): GraphQLScalarType {
        return ExtendedScalars.Date
    }

    @Bean
    fun dateTimeScalarType(): GraphQLScalarType {
        return ExtendedScalars.DateTime
    }
}
