package community.flock.eco.workday.application.mocks

import community.flock.eco.workday.application.model.Laptop
import community.flock.eco.workday.application.repository.LaptopRepository
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import java.time.LocalDate

@Component
@ConditionalOnProperty(prefix = "flock.eco.workday", name = ["develop"])
class LoadLaptopData(
    private val laptopRepository: LaptopRepository,
    private val loadPersonData: LoadPersonData,
    loadData: LoadData,
) {
    val data: MutableSet<Laptop> = mutableSetOf()

    init {
        loadData.load {
            create(
                name = "MacBook Pro 16 (2023)",
                serialNumber = "C02XK1ABCD01",
                contractSigned = true,
                purchaseDate = LocalDate.of(2023, 11, 14),
                email = "tommy@sesam.straat",
            )
            create(
                name = "MacBook Air 13 (2024)",
                serialNumber = "C02XK1ABCD02",
                contractSigned = false,
                purchaseDate = LocalDate.of(2024, 3, 20),
                email = "pino@sesam.straat",
            )
            create(
                name = "ThinkPad X1 Carbon",
                serialNumber = "PF3ABCD03",
                contractSigned = true,
                purchaseDate = LocalDate.of(2022, 6, 1),
                email = "bert@sesam.straat",
            )
            create(
                name = "MacBook Pro 14 (2022) spare",
                serialNumber = "C02XK1ABCD04",
            )
        }
    }

    private fun create(
        name: String,
        serialNumber: String,
        contractSigned: Boolean = false,
        purchaseDate: LocalDate? = null,
        email: String? = null,
    ) = Laptop(
        name = name,
        serialNumber = serialNumber,
        contractSigned = contractSigned,
        purchaseDate = purchaseDate,
        person = email?.let { loadPersonData.findPersonByUserEmail(it) },
    ).save()

    private fun Laptop.save(): Laptop =
        laptopRepository
            .save(this)
            .also { data.add(it) }
}
