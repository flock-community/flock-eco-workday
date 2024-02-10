package mocks

import java.time.LocalDate

enum class Role {
    USER,
    ADMIN,
}

data class User(
    val firstName: String,
    val lastName: String,
    val role: Role = Role.USER,
    val active: Boolean = true,
    val birthdate: LocalDate? = null,
    val joinDate: LocalDate? = null,
    val shoeSize: String? = null,
    val shirtSize: String? = null,
)

val users =
    listOf(
        User(
            "Tommy",
            "Dog",
            birthdate = LocalDate.of(1980, 5, 8),
            joinDate = LocalDate.of(2000, 5, 8),
        ),
        User(
            "Ieniemienie",
            "Mouse",
            birthdate = LocalDate.now(),
            shoeSize = "26,5",
            shirtSize = "XXS",
        ),
        User(
            "Pino",
            "Woodpecker",
            joinDate = LocalDate.of(1983, 6, 7),
            shoeSize = "53",
            shirtSize = "XXXXL",
        ),
        User("Bert", "Muppets", role = Role.ADMIN, shoeSize = "36,5", shirtSize = "M"),
        User("Ernie", "Muppets", shoeSize = "36,5", shirtSize = "M"),
        User("Aart", "Staartjes", active = false),
    )
