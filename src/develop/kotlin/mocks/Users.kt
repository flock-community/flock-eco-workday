package mocks

enum class Role {
    USER, ADMIN
}

data class User(
    val firstName: String,
    val lastName: String,
    val role: Role = Role.USER,
    val active: Boolean = true
)

val users = listOf(
    User("Tommy", "Dog",),
    User("Ieniemienie", "Mouse"),
    User("Pino", "Woodpecker"),
    User("Bert", "Muppets", role = Role.ADMIN),
    User("Ernie", "Muppets"),
    User("Aart", "Staartjes", active = false)
)
