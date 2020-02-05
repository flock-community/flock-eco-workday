package community.flock.eco.workday.services

import community.flock.eco.workday.ApplicationConfiguration
import community.flock.eco.workday.helpers.DataHelper
import java.time.LocalDate
import kotlin.test.assertEquals
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest
import org.springframework.context.annotation.ComponentScan
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@ContextConfiguration(classes = [ApplicationConfiguration::class])
@DataJpaTest
@AutoConfigureTestDatabase
@ComponentScan(basePackages = [
    "community.flock.eco.workday.helpers"
])
class GraphServiceTest {

    @Autowired
    lateinit var dataHelper: DataHelper

    @Autowired
    lateinit var graphService: GraphService

    @Test
    fun `find revenue per month`() {

        val from = LocalDate.of(2020, 1, 1)
        val to = LocalDate.of(2020, 12, 31)

        val data = dataHelper.createDataSet1()
        val res = graphService.revenuePerMonth(from, to)

        assertEquals(12, res.size)
        assertEquals(34720.0, res.entries.first().value)
    }
}
