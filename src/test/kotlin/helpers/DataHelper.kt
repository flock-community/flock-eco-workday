package community.flock.eco.workday.helpers

import community.flock.eco.workday.model.Assignment
import community.flock.eco.workday.model.Contract
import java.time.LocalDate
import org.springframework.context.annotation.Import
import org.springframework.stereotype.Component

@Component
@Import(CreateHelper::class)
class DataHelper(
    val createHelper: CreateHelper
) {

    fun createAssignmentData(): MutableMap<String, Assignment> {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val client = createHelper.createClient("client")
        val person = createHelper.createPerson("firstname", "lastname")

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

    fun createContractData(): MutableMap<String, Contract> {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2021, 12, 31)

        val person = createHelper.createPerson("firstname", "lastname")

        val res = mutableMapOf<String, Contract>()
        // In range
        res["in1"] = createHelper.createContractExternal(person, from.plusMonths(1), to.minusMonths(1))
        res["in2"] = createHelper.createContractExternal(person, from.minusMonths(1), to.minusMonths(1))
        res["in3"] = createHelper.createContractExternal(person, from.plusMonths(1), to.plusMonths(1))
        res["in4"] = createHelper.createContractExternal(person, from.minusMonths(1), to.plusMonths(1))
        res["in5"] = createHelper.createContractExternal(person, from.plusMonths(1), null)
        res["in6"] = createHelper.createContractExternal(person, from.minusMonths(1), null)

        // Out range
        res["ex1"] = createHelper.createContractExternal(person, to.plusMonths(1), to.minusMonths(3))
        res["ex2"] = createHelper.createContractExternal(person, from.minusMonths(3), from.minusMonths(1))
        res["ex3"] = createHelper.createContractExternal(person, to.plusMonths(1), null)

        return res
    }
}
