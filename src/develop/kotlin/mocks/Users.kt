package mocks

import java.time.LocalDate

enum class Role {
    USER, ADMIN
}

data class User(
    val firstName: String,
    val lastName: String,
    val role: Role = Role.USER,
    val active: Boolean = true,
    val birthdate: LocalDate? = null,
    val joinDate: LocalDate? = null
)

val users = listOf(
    User(
        "Tommy",
        "Dog",
        birthdate = LocalDate.of(1980, 5, 8),
        joinDate = LocalDate.of(2000, 5, 8)
    ),
    User(
        "Ieniemienie",
        "Mouse",
        birthdate = LocalDate.of(1985, 3, 5)
    ),
    User(
        "Pino",
        "Woodpecker",
        joinDate = LocalDate.of(1983, 6, 7)
    ),
    User("Bert", "Muppets", role = Role.ADMIN),
    User("Ernie", "Muppets"),
    User("Aart", "Staartjes", active = false)
)
