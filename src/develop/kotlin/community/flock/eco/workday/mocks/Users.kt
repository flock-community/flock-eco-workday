package community.flock.eco.workday.mocks

import java.time.LocalDate

enum class Role {
    USER, ADMIN
}

data class MockUser(
    val firstName: String,
    val lastName: String,
    val kratosId: String,
    val role: Role = Role.USER,
    val active: Boolean = true,
    val birthdate: LocalDate? = null,
    val joinDate: LocalDate? = null
)

data class KratosIdentity(val id: String, val email: String)

val mockUsers = listOf(
    MockUser(
        "Tommy",
        "Dog",
        kratosId = "00000000-0000-0000-0000-000000000001",
        birthdate = LocalDate.of(1980, 5, 8),
        joinDate = LocalDate.of(2000, 5, 8)
    ),
    MockUser(
        "Ieniemienie",
        "Mouse",
        kratosId = "00000000-0000-0000-0000-000000000002",
        birthdate = LocalDate.now()
    ),
    MockUser(
        "Pino",
        "Woodpecker",
        kratosId = "00000000-0000-0000-0000-000000000003",
        joinDate = LocalDate.of(1983, 6, 7)
    ),
    MockUser("Bert", "Muppets", kratosId = "00000000-0000-0000-0000-000000000004", role = Role.ADMIN),
    MockUser("Ernie", "Muppets", kratosId = "00000000-0000-0000-0000-000000000005"),
    MockUser("Aart", "Staartjes", kratosId = "00000000-0000-0000-0000-000000000006", active = false)
)
