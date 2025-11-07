import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Typography,
  FormControlLabel,
  Checkbox,
  IconButton,
  Button,
  Select,
  MenuItem,
  Grid,
  Divider,
  Paper,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { useStyles } from "./styles";
import { CalendarDay } from "./CalendarDay";
import {
  FreeDaySettings,
  FreeDaySettingsValue,
} from "../../components/FreeDaySettings";
import { QuickFillButtons } from "../../components/QuickFillButtons";
import { WorkdaySummary } from "../../components/WorkdaySummary";
import {
  EVENT_COLOR,
  SICKNESS_COLOR,
  VACATION_COLOR,
  OVERLAP_COLOR,
  WorkDayState,
} from "./types";
import {
  calculateWeekTotal,
  generateCalendarData,
  updateCalendarWithState,
  calculateMonthTotal,
} from "./calendarUtils";
import { useMonthPeriods } from "../hooks/useMonthPeriods";
import dayjs from "dayjs";

interface CalendarGridProps {
  currentMonth: dayjs.Dayjs;
  state: WorkDayState | null;
  events: Array<{ date: string; hours: number; description?: string }>;
  leaveData: Array<{
    date: string;
    hours: number;
    description?: string;
    status?: string;
  }>;
  sickData: Array<{
    date: string;
    hours: number;
    description?: string;
    status?: string;
  }>;
  showWeekends: boolean;
  onMonthChange: (month: dayjs.Dayjs) => void;
  onToggleWeekends: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDayHoursChange: (date: dayjs.Dayjs, hours: number, type?: string) => void;
  onQuickFill: (hours: number, targetMonth?: dayjs.Dayjs) => void;
  onDateRangeChange?: (
    from: dayjs.Dayjs,
    to: dayjs.Dayjs,
    resetDays?: boolean
  ) => void;
  onSelectedWeeksChange?: (weeks: number[]) => void;
  initialMonths?: dayjs.Dayjs[]; // NEW: Optional prop for initial months
  onMonthsChange?: (months: dayjs.Dayjs[]) => void; // NEW: Optional callback for month changes
  values?: WorkDayState;
  setFieldValue?: <K extends keyof WorkDayState>(
    field: K,
    value: WorkDayState[K]
  ) => void;
  overlappingWorkdays?: WorkDayState[]; // Workdays that might overlap with the current one
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentMonth,
  state,
  events,
  leaveData,
  sickData,
  showWeekends,
  onMonthChange,
  onToggleWeekends,
  onDayHoursChange,
  onQuickFill,
  onDateRangeChange,
  onSelectedWeeksChange,
  initialMonths,
  onMonthsChange,
  values,
  setFieldValue,
  overlappingWorkdays = [],
}) => {
  const classes = useStyles();
  const [updateKey, setUpdateKey] = useState(0);

  // Use month periods management hook
  const {
    monthPeriods,
    handleYearMonthChange,
    handleAddMonth,
    handleRemoveMonth,
    getWeeksInMonth,
  } = useMonthPeriods({
    initialMonths,
    currentMonth,
    state,
    onMonthsChange,
    onSelectedWeeksChange,
    onDateRangeChange,
  });

  // Free day settings state
  const [freeDaySettings, setFreeDaySettings] = useState<FreeDaySettingsValue>(
    () => {
      const savedSettings = localStorage.getItem("freeDaySettings");
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch (e) {
          console.error("Error parsing free day settings:", e);
        }
      }
      return {
        enabled: false,
        frequency: "every",
        dayOfWeek: 5,
      };
    }
  );

  // Force re-render on data changes
  useEffect(() => {
    setUpdateKey((prev) => prev + 1);
  }, [state, events, leaveData, sickData, showWeekends]);

  // Save free day settings
  useEffect(() => {
    try {
      localStorage.setItem("freeDaySettings", JSON.stringify(freeDaySettings));
    } catch (e) {
      console.error("Error saving free day settings:", e);
    }
  }, [freeDaySettings]);

  // Handle day hours change
  const handleDayHoursChange = (date, hours, type = "regular") => {
    onDayHoursChange(date, hours, type);
    setUpdateKey((prev) => prev + 1);
  };

  // Quick fill hours for a specific month
  const handleQuickFill = (hours, monthId) => {
    // Find the month period by ID
    const monthPeriod = monthPeriods.find((period) => period.id === monthId);

    if (!monthPeriod) return;

    // Get the month date from the period
    const targetMonth = monthPeriod.date.clone();

    // Call the parent component's onQuickFill with the target month
    onQuickFill(hours, targetMonth);

    // Force re-render after filling
    setUpdateKey((prev) => prev + 1);
  };

  // Check if a date is a free day
  const isFreeDayDate = (date: dayjs.Dayjs): boolean => {
    if (!freeDaySettings.enabled) return false;
    if (date.day() !== freeDaySettings.dayOfWeek) return false;

    if (freeDaySettings.frequency === "every") {
      return true;
    } else if (freeDaySettings.frequency === "odd") {
      return date.week() % 2 !== 0;
    } else if (freeDaySettings.frequency === "even") {
      return date.week() % 2 === 0;
    }

    return false;
  };

  // Calculate date range
  const calculateTotalDateRange = () => {
    if (monthPeriods.length === 0) return null;

    // Simple calculation based on month periods
    let earliestDate = null;
    let latestDate = null;

    monthPeriods.forEach((month) => {
      // Get the first and last day of each month
      const firstDay = month.date.startOf("month");
      const lastDay = month.date.endOf("month");

      if (earliestDate === null || firstDay.isBefore(earliestDate)) {
        earliestDate = firstDay;
      }

      if (latestDate === null || lastDay.isAfter(latestDate)) {
        latestDate = lastDay;
      }
    });

    // When a month is removed, we should update the state's date range accordingly
    // but only if there are months visible
    if (
      earliestDate &&
      latestDate &&
      onDateRangeChange &&
      state &&
      state.from &&
      state.to
    ) {
      // Check if the current range is different from the state's range
      const stateStart = state.from;
      const stateEnd = state.to;

      const needsUpdate =
        (earliestDate.isAfter(stateStart) && monthPeriods.length > 0) ||
        (latestDate.isBefore(stateEnd) && monthPeriods.length > 0);

      // If we need to update and we haven't just updated
      if (needsUpdate) {
        console.log(
          "Date range needs updating based on visible months:",
          earliestDate.format("YYYY-MM-DD"),
          "to",
          latestDate.format("YYYY-MM-DD")
        );
      }
    }

    return { earliestDate, latestDate };
  };

  // Helper functions for displaying events/leave/sick data
  const getEventsForDate = (date: dayjs.Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    return events.filter((event) => event.date === formattedDate);
  };

  const getLeaveDataForDate = (date: dayjs.Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    return leaveData.filter((leave) => leave.date === formattedDate);
  };

  const getSickDataForDate = (date: dayjs.Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    return sickData.filter((sick) => sick.date === formattedDate);
  };

  // Function to detect overlapping workdays
  const getOverlappingWorkdaysForDate = (date: dayjs.Dayjs) => {
    if (!state || overlappingWorkdays.length === 0) return [];

    const overlaps = [];

    overlappingWorkdays.forEach((workday) => {
      // Skip if it's the same workday as current state
      if (workday === state) return;

      // Check if the date is within this workday's range
      if (
        workday.from &&
        workday.to &&
        workday.days &&
        date.isBetween(workday.from, workday.to, "day", "[]")
      ) {
        // Calculate the index in the days array
        const dayIndex = date.diff(workday.from, "day");

        // Only add if the index is valid and hours > 0
        if (
          dayIndex >= 0 &&
          dayIndex < workday.days.length &&
          workday.days[dayIndex] > 0
        ) {
          // Format the date period for the tooltip
          const fromDate = workday.from.format("DD/MM/YYYY");
          const toDate = workday.to.format("DD/MM/YYYY");

          overlaps.push({
            hours: workday.days[dayIndex],
            description: `Overlapping workday (${fromDate} - ${toDate})`,
          });
        }
      }
    });

    return overlaps;
  };

  // Calculate special hours (events, leave, sick)
  const calculateSpecialHours = (dataArray) => {
    let total = 0;

    monthPeriods.forEach((month) => {
      const startOfMonth = month.date.startOf("month");
      const endOfMonth = month.date.endOf("month");

      dataArray.forEach((item) => {
        const itemDate = dayjs(item.date);

        // Use isBetween with inclusive bounds to include first and last day of month
        if (itemDate.isBetween(startOfMonth, endOfMonth, "day", "[]")) {
          total += Number(item.hours) || 8;
        }
      });
    });

    return total;
  };

  // Calculate overlapping hours for the current month periods
  const calculateOverlappingHours = () => {
    if (!state || !state.from || !state.to || overlappingWorkdays.length === 0)
      return 0;

    let total = 0;

    monthPeriods.forEach((month) => {
      const startOfMonth = month.date.startOf("month");
      const endOfMonth = month.date.endOf("month");

      // Loop through each day in the month
      let currentDay = startOfMonth;
      while (currentDay.isSameOrBefore(endOfMonth)) {
        // IMPORTANT FIX: Only count overlapping hours for days that are within the actual workday date range
        // This prevents counting overlapping hours for days outside the current workday period
        if (currentDay.isBetween(state.from, state.to, "day", "[]")) {
          const overlaps = getOverlappingWorkdaysForDate(currentDay);

          // Sum up hours from all overlaps for this day
          overlaps.forEach((overlap) => {
            total += overlap.hours;
          });
        }

        currentDay = currentDay.add(1, "day");
      }
    });

    return total;
  };

  // Calculate totals
  const eventHours = calculateSpecialHours(events);
  const sickHours = calculateSpecialHours(sickData);
  const leaveHours = calculateSpecialHours(leaveData);
  const overlapHours = calculateOverlappingHours();

  const calculateGrandTotal = () => {
    let total = 0;

    monthPeriods.forEach((month) => {
      const monthCalendarData = generateCalendarData(
        month.date,
        showWeekends,
        false
      );
      const updatedCalendarData = updateCalendarWithState(
        monthCalendarData,
        state
      );
      total += calculateMonthTotal(updatedCalendarData);
    });

    return total;
  };

  const getYearOptions = () => {
    const currentYear = dayjs().year();
    return Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  };

  const getMonthOptions = () => {
    return [
      { value: 0, label: "Januari" },
      { value: 1, label: "Februari" },
      { value: 2, label: "Maart" },
      { value: 3, label: "April" },
      { value: 4, label: "Mei" },
      { value: 5, label: "Juni" },
      { value: 6, label: "Juli" },
      { value: 7, label: "Augustus" },
      { value: 8, label: "September" },
      { value: 9, label: "Oktober" },
      { value: 10, label: "November" },
      { value: 11, label: "December" },
    ];
  };

  const yearOptions = getYearOptions();
  const monthOptions = getMonthOptions();
  const dateRange = calculateTotalDateRange();
  const dateRangeText =
    dateRange && dateRange.earliestDate && dateRange.latestDate
      ? `${dateRange.earliestDate.format(
          "DD MMM YYYY"
        )} - ${dateRange.latestDate.format("DD MMM YYYY")}`
      : "Geen datumbereik geselecteerd";

  const dayHeaders = ["Ma", "Di", "Wo", "Do", "Vr"];
  if (showWeekends) {
    dayHeaders.push("Za", "Zo");
  }

  return (
    <div className={classes.calendarContainer} key={updateKey}>
      {/* Free day settings */}
      <FreeDaySettings
        value={freeDaySettings}
        onChange={setFreeDaySettings}
        showWeekends={showWeekends}
        onToggleWeekends={onToggleWeekends}
        classes={{
          freeDaySettings: classes.freeDaySettings,
          freeDayRow: classes.freeDayRow,
          weekendToggle: classes.weekendToggle,
        }}
      />

      {/* Date range header */}
      <div className={classes.dateRangeHeader}>
        <Typography variant="subtitle1">
          Geselecteerd bereik: {dateRangeText}
        </Typography>
      </div>

      {/* Render each month period */}
      {monthPeriods.map((month) => {
        const monthCalendarData = generateCalendarData(
          month.date,
          showWeekends,
          false
        );
        const updatedCalendarData = updateCalendarWithState(
          monthCalendarData,
          state
        );
        const monthTotal = calculateMonthTotal(updatedCalendarData);
        const currentYear = month.date.year();
        const currentMonthIndex = month.date.month();

        return (
          <Paper
            key={`${month.id}-${updateKey}`}
            style={{ marginBottom: 24, padding: 16 }}
          >
            <div className={classes.monthHeaderRow}>
              {/* Month selector */}
              <div className={classes.monthSelectorContainer}>
                {/* Year selector */}
                <Select
                  value={currentYear}
                  onChange={(e) =>
                    handleYearMonthChange(
                      month.id,
                      e.target.value as number,
                      currentMonthIndex
                    )
                  }
                  className={classes.yearSelector}
                >
                  {yearOptions.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>

                {/* Month selector */}
                <Select
                  value={currentMonthIndex}
                  onChange={(e) =>
                    handleYearMonthChange(
                      month.id,
                      currentYear,
                      e.target.value as number
                    )
                  }
                  style={{ minWidth: 150, marginLeft: 8 }}
                  className={classes.monthSelector}
                >
                  {monthOptions.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>

                {/* Delete button */}
                {monthPeriods.length > 1 && (
                  <IconButton
                    color="secondary"
                    onClick={() => handleRemoveMonth(month.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            </div>

            {/* Hours fill buttons */}
            <QuickFillButtons
              onQuickFill={(hours) => handleQuickFill(hours, month.id)}
              classes={{ fillButton: classes.fillButton }}
            />

            {/* Calendar display */}
            {updatedCalendarData.length > 0 ? (
              <>
                {/* Day headers */}
                <div className={classes.weekRow}>
                  <div className={classes.weekNumberCell}>
                    <Typography variant="subtitle2">Week</Typography>
                  </div>
                  {dayHeaders.map((day, index) => (
                    <div
                      key={`${index}-${updateKey}`}
                      className={classes.dayHeader}
                    >
                      <Typography variant="subtitle1">{day}</Typography>
                    </div>
                  ))}
                  <div className={classes.totalCell}>
                    <Typography variant="subtitle1">Totaal</Typography>
                  </div>
                </div>

                {/* Calendar weeks - now showing all weeks */}
                {updatedCalendarData.map((week, weekIndex) => (
                  <div
                    key={`${month.id}-week-${weekIndex}-${updateKey}`}
                    className={classes.weekRow}
                  >
                    <div className={classes.weekNumberCell}>
                      <Typography variant="body1">{week.weekNumber}</Typography>
                    </div>
                    {week.days.map((day, dayIndex) => (
                      <CalendarDay
                        key={`${month.id}-day-${dayIndex}-${updateKey}`}
                        day={day}
                        state={state}
                        events={getEventsForDate(day.date)}
                        leaveData={getLeaveDataForDate(day.date)}
                        sickData={getSickDataForDate(day.date)}
                        overlapData={getOverlappingWorkdaysForDate(day.date)}
                        onHoursChange={handleDayHoursChange}
                      />
                    ))}
                    <div className={classes.totalCell}>
                      <Typography variant="h6">
                        {calculateWeekTotal(week.days)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <Typography
                variant="body1"
                style={{ padding: 16, textAlign: "center" }}
              >
                Geen weken beschikbaar voor deze maand
              </Typography>
            )}

            {updatedCalendarData.length > 0 && (
              <div style={{ textAlign: "right", marginTop: 16 }}>
                <Typography variant="h6">Maand Totaal: {monthTotal}</Typography>
              </div>
            )}
          </Paper>
        );
      })}

      {/* Legend and add month button */}
      <WorkdaySummary
        sickHours={sickHours}
        eventHours={eventHours}
        leaveHours={leaveHours}
        overlapHours={overlapHours}
        grandTotal={calculateGrandTotal()}
        monthCount={monthPeriods.length}
        onAddMonth={handleAddMonth}
        classes={{
          legendAndButtonRow: classes.legendAndButtonRow,
          summaryRow: classes.summaryRow,
          summaryItem: classes.summaryItem,
          summaryColor: classes.summaryColor,
          summaryText: classes.summaryText,
          summaryHours: classes.summaryHours,
          addMonthButton: classes.addMonthButton,
          monthTotal: classes.monthTotal,
          monthTotalLabel: classes.monthTotalLabel,
          monthTotalValue: classes.monthTotalValue,
        }}
      />
    </div>
  );
};
