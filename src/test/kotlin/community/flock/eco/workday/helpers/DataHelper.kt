package community.flock.eco.workday.helpers

import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import community.flock.eco.workday.model.LeaveDay
import community.flock.eco.workday.model.SickDay
import community.flock.eco.workday.model.WorkDay
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@Import(CreateHelper::class)
class DataHelper(
    val createHelper: CreateHelper,
) {
    fun createAssignmentData(): MutableMap<String, Assignment> {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val client = createHelper.createClient()
        val person = createHelper.createPerson()

        val res = mutableMapOf<String, Assignment>()
        // In range
        res["in1"] = createHelper.createAssignment(client, person, from.plusMonths(1), to.minusMonths(1))
        res["in2"] = createHelper.createAssignment(client, person, from.minusMonths(1), to.minusMonths(1))
        res["in3"] = createHelper.createAssignment(client, person, from.plusMonths(1), to.plusMonths(1))
        res["in4"] = createHelper.createAssignment(client, person, from.minusMonths(1), to.plusMonths(1))
        res["in5"] = createHelper.createAssignment(client, person, from.plusMonths(1), null)
        res["in6"] = createHelper.createAssignment(client, person, from.minusMonths(1), null)

        // Out range
        res["out1"] = createHelper.createAssignment(client, person, to.plusMonths(1), to.minusMonths(3))
        res["out2"] = createHelper.createAssignment(client, person, from.minusMonths(3), from.minusMonths(1))
        res["out3"] = createHelper.createAssignment(client, person, to.plusMonths(1), null)

        return res
    }

    fun createContractExternalData(): MutableMap<String, Contract> {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val person1 = createHelper.createPerson()
        val person2 = createHelper.createPerson()

        val res = mutableMapOf<String, Contract>()
        // In range
        res["in1"] = createHelper.createContractExternal(person1, from.plusMonths(1), to.minusMonths(1))
        res["in2"] = createHelper.createContractExternal(person2, from.minusMonths(1), to.minusMonths(1))
        res["in3"] = createHelper.createContractExternal(person1, from.plusMonths(1), to.plusMonths(1))
        res["in4"] = createHelper.createContractExternal(person2, from.minusMonths(1), to.plusMonths(1))
        res["in5"] = createHelper.createContractExternal(person1, from.plusMonths(1), null)
        res["in6"] = createHelper.createContractExternal(person2, from.minusMonths(1), null)

        // Out range
        res["ex1"] = createHelper.createContractExternal(person1, to.plusMonths(1), to.minusMonths(3))
        res["ex2"] = createHelper.createContractExternal(person2, from.minusMonths(3), from.minusMonths(1))
        res["ex3"] = createHelper.createContractExternal(person1, to.plusMonths(1), null)

        return res
    }

    fun createContractInternalData(): MutableMap<String, Contract> {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val person1 = createHelper.createPerson()
        val person2 = createHelper.createPerson()
        val person3 = createHelper.createPerson()
        val person4 = createHelper.createPerson()

        val res = mutableMapOf<String, Contract>()
        // In range
        res["in1"] = createHelper.createContractInternal(person1, from, to)
        res["in2"] = createHelper.createContractInternal(person2, from, null)
        res["in3"] = createHelper.createContractInternal(person3, from, to.minusMonths(14))
        res["in4"] = createHelper.createContractInternal(person4, from.plusMonths(2), to)

        return res
    }

    fun createSickDayData(): MutableMap<String, SickDay> {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 5)

        val person1 = createHelper.createPerson()
        val person2 = createHelper.createPerson()
        val person3 = createHelper.createPerson()

        val res = mutableMapOf<String, SickDay>()
        // In range
        res["in1"] = createHelper.createSickDay(person1, from, to)
        res["in2"] = createHelper.createSickDay(person2, from, to)
        res["in3"] = createHelper.createSickDay(person3, from, to)

        return res
    }

    fun createHoliDayData(): MutableMap<String, LeaveDay> {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 5)

        val person1 = createHelper.createPerson()
        val person2 = createHelper.createPerson()
        val person3 = createHelper.createPerson()

        val res = mutableMapOf<String, LeaveDay>()
        // In range
        res["in1"] = createHelper.createHoliDay(person1, from, to)
        res["in2"] = createHelper.createHoliDay(person2, from, to)
        res["in3"] = createHelper.createHoliDay(person3, from, to)

        return res
    }

    fun createWorkDayData(): MutableMap<String, WorkDay> {
        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 1, 5)

        val person1 = createHelper.createPerson()

        val client = createHelper.createClient()
        val assignment1 = createHelper.createAssignment(client, person1, from, to)
        val assignment2 = createHelper.createAssignment(client, person1, from, to)

        val res = mutableMapOf<String, WorkDay>()
        // In range
        res["in1"] = createHelper.createWorkDay(assignment1, from, to)
        res["in2"] = createHelper.createWorkDay(assignment2, from, to)
        return res
    }
}
