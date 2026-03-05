package community.flock.eco.workday.application.budget

import community.flock.eco.workday.WorkdayIntegrationTest
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import javax.sql.DataSource
import kotlin.test.assertNotNull
import kotlin.test.assertTrue

class BudgetAllocationSchemaTest : WorkdayIntegrationTest() {
    @Autowired
    lateinit var dataSource: DataSource

    @Test
    fun `test base table exists`() {
        dataSource.connection.use { conn ->
            val rs = conn.metaData.getTables(null, null, "BUDGET_ALLOCATION", null)
            assertTrue(rs.next(), "budget_allocation table should exist")
        }
    }

    @Test
    fun `test base table columns`() {
        dataSource.connection.use { conn ->
            val columns = mutableSetOf<String>()
            val rs = conn.metaData.getColumns(null, null, "BUDGET_ALLOCATION", null)
            while (rs.next()) columns.add(rs.getString("COLUMN_NAME").uppercase())
            assertTrue("ID" in columns, "budget_allocation should have id column")
            assertTrue("CODE" in columns, "budget_allocation should have code column")
            assertTrue("PERSON_ID" in columns, "budget_allocation should have person_id column")
            assertTrue("EVENT_CODE" in columns, "budget_allocation should have event_code column")
            assertTrue("DATE" in columns, "budget_allocation should have date column")
        }
    }

    @Test
    fun `test child tables exist`() {
        dataSource.connection.use { conn ->
            for (table in listOf(
                "HACK_TIME_BUDGET_ALLOCATION",
                "STUDY_TIME_BUDGET_ALLOCATION",
                "STUDY_MONEY_BUDGET_ALLOCATION",
            )) {
                val rs = conn.metaData.getTables(null, null, table, null)
                assertTrue(rs.next(), "$table table should exist")
            }
        }
    }

    @Test
    fun `test element collection tables exist`() {
        dataSource.connection.use { conn ->
            for (table in listOf(
                "HACK_TIME_BUDGET_ALLOCATION_DAILY_TIME_ALLOCATIONS",
                "STUDY_TIME_BUDGET_ALLOCATION_DAILY_TIME_ALLOCATIONS",
                "STUDY_MONEY_BUDGET_ALLOCATION_FILES",
            )) {
                val rs = conn.metaData.getTables(null, null, table, null)
                assertTrue(rs.next(), "$table table should exist")
            }
        }
    }

    @Test
    fun `test study money amount is decimal`() {
        dataSource.connection.use { conn ->
            val rs = conn.metaData.getColumns(null, null, "STUDY_MONEY_BUDGET_ALLOCATION", "AMOUNT")
            assertTrue(rs.next(), "amount column should exist")
            // DECIMAL type in H2 - verify it's a numeric type, not DOUBLE
            val typeName = rs.getString("TYPE_NAME")
            assertTrue(
                typeName.contains("DECIMAL") || typeName.contains("NUMERIC"),
                "amount should be DECIMAL type, got $typeName",
            )
        }
    }
}
