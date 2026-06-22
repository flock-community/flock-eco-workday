package community.flock.eco.workday.application.migrations

import liquibase.change.custom.CustomTaskChange
import liquibase.database.Database
import liquibase.database.jvm.JdbcConnection
import liquibase.exception.ValidationErrors
import liquibase.resource.ResourceAccessor
import java.sql.Connection

// Catch-up before event_days is dropped: 031 backfilled day_days only for EventDays it
// created from event_persons, so fill any EventDay still missing a breakdown from its
// event's event_days. Only touches EventDays with empty day_days, so re-running is safe.
class BackfillEventDayBreakdown : CustomTaskChange {
    private var filled = 0

    override fun execute(database: Database) {
        val connection = (database.connection as JdbcConnection).underlyingConnection
        val daysByEvent = readDaysByEvent(connection)

        val insertDayValue = connection.prepareStatement(INSERT_DAY_VALUE)
        val missing = connection.prepareStatement(SELECT_EVENT_DAYS_WITHOUT_BREAKDOWN)
        try {
            missing.executeQuery().use { rows ->
                while (rows.next()) {
                    val dayId = rows.getLong("day_id")
                    val eventId = rows.getLong("event_id")
                    daysByEvent[eventId].orEmpty().forEach { dayValue ->
                        insertDayValue.run {
                            setLong(1, dayId)
                            setDouble(2, dayValue)
                            executeUpdate()
                        }
                        filled++
                    }
                }
            }
        } finally {
            listOf(missing, insertDayValue).forEach { it.close() }
        }
    }

    private fun readDaysByEvent(connection: Connection): Map<Long, List<Double>> =
        connection.prepareStatement("SELECT event_id, days FROM event_days").use { stmt ->
            stmt.executeQuery().use { rows ->
                buildMap<Long, MutableList<Double>> {
                    while (rows.next()) {
                        getOrPut(rows.getLong("event_id")) { mutableListOf() }.add(rows.getDouble("days"))
                    }
                }
            }
        }

    override fun getConfirmationMessage() = "Backfilled $filled day_days rows from event_days for EventDays missing a breakdown"

    override fun setUp() = Unit

    override fun setFileOpener(resourceAccessor: ResourceAccessor?) = Unit

    override fun validate(database: Database?): ValidationErrors = ValidationErrors()

    private companion object {
        const val INSERT_DAY_VALUE = "INSERT INTO day_days (day_id, days) VALUES (?, ?)"
        const val SELECT_EVENT_DAYS_WITHOUT_BREAKDOWN =
            """SELECT ed.id AS day_id, ed.event_id AS event_id
               FROM event_day ed
               WHERE NOT EXISTS (SELECT 1 FROM day_days dd WHERE dd.day_id = ed.id)"""
    }
}
