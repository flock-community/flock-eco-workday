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
import {
  calculateSpecialHours,
  calculateOverlappingHours,
  calculateGrandTotal,
  calculateTotalDateRange,
  getYearOptions,
  getMonthOptions,
  getEventsForDate,
  getLeaveDataForDate,
  getSickDataForDate,
  getOverlappingWorkdaysForDate,
} from "../utils/gridCalculations";
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

  // Calculate totals using utility functions
  const eventHours = calculateSpecialHours(events, monthPeriods);
  const sickHours = calculateSpecialHours(sickData, monthPeriods);
  const leaveHours = calculateSpecialHours(leaveData, monthPeriods);
  const overlapHours = calculateOverlappingHours(
    monthPeriods,
    state,
    overlappingWorkdays
  );

  const yearOptions = getYearOptions();
  const monthOptions = getMonthOptions();
  const dateRange = calculateTotalDateRange(
    monthPeriods,
    state,
    onDateRangeChange
  );
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
                        events={getEventsForDate(day.date, events)}
                        leaveData={getLeaveDataForDate(day.date, leaveData)}
                        sickData={getSickDataForDate(day.date, sickData)}
                        overlapData={getOverlappingWorkdaysForDate(
                          day.date,
                          state,
                          overlappingWorkdays
                        )}
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
        grandTotal={calculateGrandTotal(monthPeriods, showWeekends, state)}
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
