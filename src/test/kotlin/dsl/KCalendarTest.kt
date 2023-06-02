package dsl

import biweekly.property.DurationProperty
import biweekly.property.Summary
import biweekly.property.Uid
import biweekly.util.Duration
import community.flock.eco.workday.dsl.calendar
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.util.Calendar
import java.util.TimeZone

class KCalendarTest {

    @Test
    fun `Empty calendar`() {
        val calendar = calendar { }

        assertThat(calendar.events).isEmpty()
    }

    @Test
    fun `Events have all properties`() {
        val startDate = LocalDate.of(2022, 2, 3)

        val calendar = calendar {
            event {
                this.startDate = startDate
                this.durationInDays = 3
                this.uuid = "test-uuid"
                this.summary = "test-summary"
            }
        }

        assertThat(calendar.events).hasSize(1)

        val event = calendar.events.first()

        val expectedStartDate = Calendar.getInstance(TimeZone.getDefault())
            .apply {
                set(2022, 1, 3, 0, 0, 0)
                set(Calendar.MILLISECOND, 0)
            }.time

        assertThat(event.dateStart.value).isEqualTo(expectedStartDate)
        assertThat(event.duration).isEqualTo(DurationProperty(Duration.builder().days(3).build()))
        assertThat(event.uid).isEqualTo(Uid("test-uuid"))
        assertThat(event.summary).isEqualTo(Summary("test-summary"))
    }

    @Test
    fun `Multiple events`() {
        val startDate = LocalDate.of(2022, 2, 3)

        val calendar = calendar {
            event {
                this.startDate = startDate
                this.durationInDays = 3
                this.uuid = "test-uuid"
                this.summary = "test-summary"
            }

            event {
                this.startDate = startDate
                this.durationInDays = 4
                this.uuid = "test-uuid-2"
                this.summary = "test-summary-2"
            }
        }

        assertThat(calendar.events).hasSize(2)
    }
}
