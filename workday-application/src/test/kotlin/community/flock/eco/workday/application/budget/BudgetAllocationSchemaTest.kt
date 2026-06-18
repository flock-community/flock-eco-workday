package community.flock.eco.workday.application.budget

import community.flock.eco.workday.WorkdayIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import javax.sql.DataSource
import kotlin.test.assertTrue

class BudgetAllocationSchemaTest : WorkdayIntegrationTest() {
    @Autowired
    lateinit var dataSource: DataSource

    @Test
    fun `test aggregate tables exist`() {
        dataSource.connection.use { conn ->
            for (table in listOf("time_allocation", "money_allocation")) {
                val rs = conn.metaData.getTables(null, null, table, null)
                assertTrue(rs.next(), "$table table should exist")
            }
        }
    }

    @Test
    fun `test time allocation columns`() {
        dataSource.connection.use { conn ->
            val columns = mutableSetOf<String>()
            val rs = conn.metaData.getColumns(null, null, "time_allocation", null)
            while (rs.next()) columns.add(rs.getString("COLUMN_NAME").uppercase())
            assertTrue("ID" in columns, "time_allocation should have id column")
            assertTrue("CODE" in columns, "time_allocation should have code column")
            assertTrue("PERSON_ID" in columns, "time_allocation should have person_id column")
            assertTrue("EVENT_CODE" in columns, "time_allocation should have event_code column")
            assertTrue("DATE" in columns, "time_allocation should have date column")
        }
    }

    @Test
    fun `test collection tables exist`() {
        dataSource.connection.use { conn ->
            for (table in listOf("time_allocation_days", "money_allocation_files")) {
                val rs = conn.metaData.getTables(null, null, table, null)
                assertTrue(rs.next(), "$table table should exist")
            }
        }
    }

    @Test
    fun `test daily allocation row carries a type`() {
        dataSource.connection.use { conn ->
            val columns = mutableSetOf<String>()
            val rs = conn.metaData.getColumns(null, null, "time_allocation_days", null)
            while (rs.next()) columns.add(rs.getString("COLUMN_NAME").uppercase())
            assertTrue("TIME_ALLOCATION_ID" in columns, "time_allocation_days should reference its allocation")
            assertTrue("DATE" in columns, "time_allocation_days should have date column")
            assertTrue("HOURS" in columns, "time_allocation_days should have hours column")
            assertTrue("TYPE" in columns, "time_allocation_days should have type column")
        }
    }

    @Test
    fun `test money allocation amount is decimal`() {
        dataSource.connection.use { conn ->
            val rs = conn.metaData.getColumns(null, null, "money_allocation", "amount")
            assertTrue(rs.next(), "amount column should exist")
            val typeName = rs.getString("TYPE_NAME")
            assertTrue(
                typeName.contains("DECIMAL") || typeName.contains("NUMERIC"),
                "amount should be DECIMAL type, got $typeName",
            )
        }
    }
}
