package community.flock.eco.workday.application.migrations

import liquibase.change.custom.CustomTaskChange
import liquibase.database.Database
import liquibase.database.jvm.JdbcConnection
import liquibase.exception.ValidationErrors
import liquibase.resource.ResourceAccessor
import java.sql.PreparedStatement
import java.util.UUID

// New day ids are drawn from day_seq (the Day hierarchy's own sequence), keeping
// the shared `day` table collision-free without touching the sequence afterwards.
// Events with no event_persons rows get no EventDays (none exist in seed data;
// confirm the same on prod before deploy).
// Skips pairs that already have an event_day, so it is safe to re-run as the Stage-2
// catch-up (db.changelog-033) over rows written during a Stage-1 rollback window.
class BackfillEventDays : CustomTaskChange {
    override fun execute(database: Database) {
        val connection = (database.connection as JdbcConnection).underlyingConnection
        val daysByEvent = readDaysByEvent(connection)

        val nextId = connection.prepareStatement(nextIdSql(database))
        val insertDay = connection.prepareStatement(INSERT_DAY)
        val insertEventDay = connection.prepareStatement(INSERT_EVENT_DAY)
        val insertDayValue = connection.prepareStatement(INSERT_DAY_VALUE)
        val pairs = connection.prepareStatement(SELECT_PAIRS)
        try {
            pairs.executeQuery().use { rows ->
                while (rows.next()) {
                    val eventId = rows.getLong("event_id")
                    val id = nextId.nextValue()
                    insertDay.run {
                        setLong(1, id)
                        setString(2, UUID.randomUUID().toString())
                        setDate(3, rows.getDate("event_from"))
                        setDouble(4, rows.getDouble("hours"))
                        setDate(5, rows.getDate("event_to"))
                        executeUpdate()
                    }
                    insertEventDay.run {
                        setLong(1, id)
                        setLong(2, rows.getLong("persons_id"))
                        setLong(3, eventId)
                        executeUpdate()
                    }
                    daysByEvent[eventId].orEmpty().forEach { dayValue ->
                        insertDayValue.run {
                            setLong(1, id)
                            setDouble(2, dayValue)
                            executeUpdate()
                        }
                    }
                }
            }
        } finally {
            listOf(pairs, insertDayValue, insertEventDay, insertDay, nextId).forEach { it.close() }
        }
    }

    private fun nextIdSql(database: Database) =
        if (database.databaseProductName.contains("PostgreSQL", ignoreCase = true)) {
            "SELECT nextval('day_seq')"
        } else {
            "SELECT NEXT VALUE FOR day_seq"
        }

    private fun PreparedStatement.nextValue(): Long = executeQuery().use { it.next(); it.getLong(1) }

    private fun readDaysByEvent(connection: java.sql.Connection): Map<Long, List<Double>> =
        connection.prepareStatement("SELECT event_id, days FROM event_days").use { stmt ->
            stmt.executeQuery().use { rows ->
                buildMap<Long, MutableList<Double>> {
                    while (rows.next()) {
                        getOrPut(rows.getLong("event_id")) { mutableListOf() }.add(rows.getDouble("days"))
                    }
                }
            }
        }

    override fun getConfirmationMessage() = "Backfilled event_day rows from event_persons"

    override fun setUp() = Unit

    override fun setFileOpener(resourceAccessor: ResourceAccessor?) = Unit

    override fun validate(database: Database?): ValidationErrors = ValidationErrors()

    private companion object {
        const val INSERT_DAY = """INSERT INTO "day" ("id", "code", "from", "hours", "to") VALUES (?, ?, ?, ?, ?)"""
        const val INSERT_EVENT_DAY = "INSERT INTO event_day (id, person_id, event_id) VALUES (?, ?, ?)"
        const val INSERT_DAY_VALUE = "INSERT INTO day_days (day_id, days) VALUES (?, ?)"
        const val SELECT_PAIRS =
            """SELECT ep.event_id AS event_id, ep.persons_id AS persons_id,
                      e."from" AS event_from, e."to" AS event_to, e."hours" AS hours
               FROM event_persons ep JOIN "event" e ON e.id = ep.event_id
               WHERE NOT EXISTS (
                   SELECT 1 FROM event_day ed
                   WHERE ed.event_id = ep.event_id AND ed.person_id = ep.persons_id
               )"""
    }
}
