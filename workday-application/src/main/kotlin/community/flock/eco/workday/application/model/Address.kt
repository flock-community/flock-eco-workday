package community.flock.eco.workday.application.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable

/**
 * Dutch postal address, embedded in the owning entity's table.
 *
 * Every column is nullable because the address as a whole is optional: when all
 * of them are null Hibernate hydrates the embedded attribute as null.
 */
@Embeddable
data class Address(
    @Column(name = "street")
    val street: String,
    @Column(name = "house_number", length = 10)
    val houseNumber: String,
    @Column(name = "house_number_addition", length = 20)
    val houseNumberAddition: String? = null,
    @Column(name = "postal_code", length = 10)
    val postalCode: String,
    @Column(name = "city")
    val city: String,
)
