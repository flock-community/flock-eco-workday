package community.flock.eco.workday.application.migrations

import liquibase.change.custom.CustomTaskChange
import liquibase.database.Database
import liquibase.database.jvm.JdbcConnection
import liquibase.exception.ValidationErrors
import liquibase.resource.ResourceAccessor
import java.sql.Connection
import java.util.UUID

// New day ids are drawn from day_seq (the Day hierarchy's own sequence), keeping
// the shared `day` table collision-free without touching the sequence afterwards.
// Events with no event_persons rows get no EventDays (none exist in seed data;
// confirm the same on prod before deploy).
class BackfillEventDays : CustomTaskChange {
    override fun execute(database: Database) {
        val connection = (database.connection as JdbcConnection).underlyingConnection
        val nextIdSql = nextIdSql(database)
        val daysByEvent = connection.readDaysByEvent()

        connection.prepareStatement(SELECT_PAIRS).use { stmt ->
            stmt.executeQuery().use { rows ->
                while (rows.next()) {
                    val eventId = rows.getLong("event_id")
                    val personId = rows.getLong("persons_id")
                    val newId = connection.nextId(nextIdSql)
                    connection.insertDay(newId, rows.getDate("event_from"), rows.getDouble("hours"), rows.getDate("event_to"))
                    connection.insertEventDay(newId, personId, eventId)
                    daysByEvent[eventId].orEmpty().forEach { connection.insertDayValue(newId, it) }
                }
            }
        }
    }

    private fun nextIdSql(database: Database) =
        if (database.databaseProductName.contains("PostgreSQL", ignoreCase = true)) {
            "SELECT nextval('day_seq')"
        } else {
            "SELECT NEXT VALUE FOR day_seq"
        }

    private fun Connection.nextId(sql: String): Long =
        prepareStatement(sql).use { it.executeQuery().use { rows -> rows.next(); rows.getLong(1) } }

    private fun Connection.readDaysByEvent(): Map<Long, List<Double>> =
        prepareStatement("SELECT event_id, days FROM event_days").use { stmt ->
            stmt.executeQuery().use { rows ->
                buildMap<Long, MutableList<Double>> {
                    while (rows.next()) {
                        getOrPut(rows.getLong("event_id")) { mutableListOf() }.add(rows.getDouble("days"))
                    }
                }
            }
        }

    private fun Connection.insertDay(
        id: Long,
        from: java.sql.Date,
        hours: Double,
        to: java.sql.Date,
    ) = prepareStatement("""INSERT INTO "day" ("id", "code", "from", "hours", "to") VALUES (?, ?, ?, ?, ?)""").use {
        it.setLong(1, id)
        it.setString(2, UUID.randomUUID().toString())
        it.setDate(3, from)
        it.setDouble(4, hours)
        it.setDate(5, to)
        it.executeUpdate()
    }

    private fun Connection.insertEventDay(
        id: Long,
        personId: Long,
        eventId: Long,
    ) = prepareStatement("INSERT INTO event_day (id, person_id, event_id) VALUES (?, ?, ?)").use {
        it.setLong(1, id)
        it.setLong(2, personId)
        it.setLong(3, eventId)
        it.executeUpdate()
    }

    private fun Connection.insertDayValue(
        dayId: Long,
        days: Double,
    ) = prepareStatement("INSERT INTO day_days (day_id, days) VALUES (?, ?)").use {
        it.setLong(1, dayId)
        it.setDouble(2, days)
        it.executeUpdate()
    }

    override fun getConfirmationMessage() = "Backfilled event_day rows from event_persons"

    override fun setUp() = Unit

    override fun setFileOpener(resourceAccessor: ResourceAccessor?) = Unit

    override fun validate(database: Database?): ValidationErrors = ValidationErrors()

    private companion object {
        const val SELECT_PAIRS =
            """SELECT ep.event_id AS event_id, ep.persons_id AS persons_id,
                      e."from" AS event_from, e."to" AS event_to, e."hours" AS hours
               FROM event_persons ep JOIN "event" e ON e.id = ep.event_id"""
    }
}
