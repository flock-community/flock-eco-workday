package community.flock.eco.workday.model

import java.time.LocalDate
import java.util.UUID

abstract class ContractAbstract {
    private val testPerson =
        Person(
            id = 0,
            uuid = UUID.randomUUID(),
            firstname = "Test",
            lastname = "Test",
            email = "test@test.test",
            position = "Hm",
            number = null,
            reminders = false,
            user = null,
        )

    fun createContractExternal(
        startDate: LocalDate,
        endDate: LocalDate? = null,
        hourlyRate: Double,
        hoursPerWeek: Int,
    ): ContractExternal {
        return ContractExternal(
            id = 1L,
            code = UUID.randomUUID().toString(),
            person = testPerson,
            from = startDate,
            to = endDate,
            hoursPerWeek = hoursPerWeek,
            hourlyRate = hourlyRate,
            billable = true,
        )
    }

    fun createContractManagement(
        startDate: LocalDate,
        endDate: LocalDate? = null,
        salary: Double,
    ): ContractManagement {
        return ContractManagement(
            id = 1L,
            code = UUID.randomUUID().toString(),
            person = testPerson,
            from = startDate,
            to = endDate,
            monthlyFee = salary,
        )
    }

    fun createContractInternal(
        startDate: LocalDate,
        endDate: LocalDate? = null,
        salary: Double,
    ): ContractInternal {
        return ContractInternal(
            id = 1L,
            code = UUID.randomUUID().toString(),
            person = testPerson,
            from = startDate,
            to = endDate,
            monthlySalary = salary,
            hoursPerWeek = 36,
            holidayHours = 30,
            hackHours = 12,
            billable = true,
        )
    }
}
