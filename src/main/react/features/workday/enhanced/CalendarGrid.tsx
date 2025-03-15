import React, { useEffect, useState } from "react";
import { Typography, FormControlLabel, Checkbox, IconButton, Button, Select, MenuItem, Grid, Divider, Paper, Chip } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { useStyles } from "./styles";
import { CalendarDay } from "./CalendarDay";
import { EVENT_COLOR, SICKNESS_COLOR, VACATION_COLOR, WorkDayState } from "./types";
import { calculateWeekTotal, generateCalendarData, updateCalendarWithState, calculateMonthTotal } from "./calendarUtils";
import dayjs from "dayjs";

interface CalendarGridProps {
  currentMonth: dayjs.Dayjs;
  state: WorkDayState | null;
  events: any[];
  leaveData: any[];
  sickData: any[];
  showWeekends: boolean;
  onMonthChange: (month: dayjs.Dayjs) => void;
  onToggleWeekends: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDayHoursChange: (date: any, hours: number, type?: string) => void;
  onQuickFill: (hours: number) => void;
  onDateRangeChange?: (from: dayjs.Dayjs, to: dayjs.Dayjs) => void;
  values?: any;
  setFieldValue?: (field: string, value: any) => void;
}

// Interface for free day settings
interface FreeDaySettings {
  enabled: boolean;
  frequency: string; // 'every', 'odd', 'even'
  dayOfWeek: number; // 0-6, where 0 is Sunday, 1 is Monday, etc.
}

// Interface for a month period
interface MonthPeriod {
  id: string;
  date: dayjs.Dayjs;
  selectedWeeks: number[]; // Array of week numbers to display
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
  onDateRangeChange
}) => {
  const classes = useStyles();
  // Add a local state to force re-renders when data changes
  const [updateKey, setUpdateKey] = useState(Date.now());
  // Multiple month periods
  const [monthPeriods, setMonthPeriods] = useState<MonthPeriod[]>([]);

  // Free day settings state
  const [freeDaySettings, setFreeDaySettings] = useState<FreeDaySettings>(() => {
    // Try to load from localStorage
    const savedSettings = localStorage.getItem('freeDaySettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      enabled: false,
      frequency: 'every',
      dayOfWeek: 5 // Default to Friday
    };
  });

  // Helper to get week numbers for a month
  const getWeeksInMonth = (date: dayjs.Dayjs): number[] => {
    const startOfMonth = date.startOf('month');
    const endOfMonth = date.endOf('month');

    // Find all week numbers that overlap with this month
    const weeks = new Set<number>();
    let currentDate = startOfMonth;

    while (currentDate.isSameOrBefore(endOfMonth, 'day')) {
      weeks.add(currentDate.week());
      currentDate = currentDate.add(1, 'week');
    }

    return Array.from(weeks);
  };

  // Initialize with a single month period based on currentMonth
  useEffect(() => {
    if (monthPeriods.length === 0) {
      // Ensure we use the start of the month to avoid date selection issues
      const firstOfMonth = currentMonth.startOf('month');
      const weeksInMonth = getWeeksInMonth(firstOfMonth);
      setMonthPeriods([{
        id: `month-${Date.now()}`,
        date: firstOfMonth,
        selectedWeeks: weeksInMonth // Select all weeks by default
      }]);
    }
  }, [currentMonth]);

  // Listen for changes to state to force re-render for totals
  useEffect(() => {
    setUpdateKey(Date.now());
  }, [state, events, leaveData, sickData, monthPeriods, showWeekends]);

  // Save free day settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('freeDaySettings', JSON.stringify(freeDaySettings));
  }, [freeDaySettings]);

  const handleCurrentMonth = () => {
    const today = dayjs().startOf('month');

    // Replace with current month
    const weeksInCurrentMonth = getWeeksInMonth(today);
    setMonthPeriods([{
      id: `month-${Date.now()}`,
      date: today,
      selectedWeeks: weeksInCurrentMonth
    }]);

    // Update the parent's state
    onMonthChange(today);
  };

  // Month period management
  const handleMonthChange = (monthId: string, newDate: string) => {
    setMonthPeriods(prev => prev.map(month => {
      if (month.id === monthId) {
        const newDateObj = dayjs(newDate).startOf('month');
        return {
          ...month,
          date: newDateObj,
          selectedWeeks: getWeeksInMonth(newDateObj) // Reset to all weeks when changing month
        };
      }
      return month;
    }));
  };

  const handleAddMonth = () => {
    // Determine the date for the new month
    let newDate;

    if (monthPeriods.length > 0) {
      const lastMonth = monthPeriods[monthPeriods.length - 1];
      newDate = lastMonth.date.add(1, 'month').startOf('month');
    } else {
      newDate = dayjs().startOf('month');
    }

    // Add the new month
    const weeksInMonth = getWeeksInMonth(newDate);
    setMonthPeriods(prev => [
      ...prev,
      {
        id: `month-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: newDate,
        selectedWeeks: weeksInMonth // Select all weeks by default
      }
    ]);
  };

  const handleRemoveMonth = (monthId: string) => {
    setMonthPeriods(prev => {
      // Don't remove if it's the last month
      if (prev.length <= 1) return prev;
      return prev.filter(month => month.id !== monthId);
    });
  };

  // Week selection within a month
  const handleToggleWeek = (monthId: string, weekNumber: number) => {
    setMonthPeriods(prev => prev.map(month => {
      if (month.id === monthId) {
        const selectedWeeks = [...month.selectedWeeks];

        if (selectedWeeks.includes(weekNumber)) {
          // Remove week
          return {
            ...month,
            selectedWeeks: selectedWeeks.filter(week => week !== weekNumber)
          };
        } else {
          // Add week
          return {
            ...month,
            selectedWeeks: [...selectedWeeks, weekNumber].sort((a, b) => a - b)
          };
        }
      }
      return month;
    }));
  };

  // Generate selectors for months
  const getMonthOptions = () => {
    // Generate months for 1 year before and after current date
    const options = [];
    const rangeStart = dayjs().subtract(1, "year").startOf('month');
    const rangeEnd = dayjs().add(1, "year").startOf('month');

    let date = rangeStart;
    while (date.isBefore(rangeEnd) || date.isSame(rangeEnd, 'month')) {
      const label = date.format("MMMM YYYY");
      options.push({
        value: date.format("YYYY-MM-01"),
        label
      });
      date = date.add(1, "month");
    }

    return options;
  };

  // Create a wrapper for onDayHoursChange to trigger re-render
  const handleDayHoursChange = (date, hours, type = 'regular') => {
    onDayHoursChange(date, hours, type);
    // Force a re-render to update totals
    setUpdateKey(Date.now());
  };

  // Simple fill button handler - just passes to parent and forces rerender
  const handleQuickFill = (hours) => {
    // Call the parent function to update the state
    onQuickFill(hours);

    // Force component to fully re-render with new state after a brief delay
    setTimeout(() => {
      setUpdateKey(Date.now());
    }, 100);
  };

  // Check if a date is a free day according to settings
  const isFreeDayDate = (date: dayjs.Dayjs): boolean => {
    if (!freeDaySettings.enabled) return false;

    // Check if the day of the week matches
    if (date.day() !== freeDaySettings.dayOfWeek) return false;

    // Handle frequency
    if (freeDaySettings.frequency === 'every') {
      return true;
    } else if (freeDaySettings.frequency === 'odd') {
      const weekNumber = date.week();
      return weekNumber % 2 !== 0;
    } else if (freeDaySettings.frequency === 'even') {
      const weekNumber = date.week();
      return weekNumber % 2 === 0;
    }

    return false;
  };

  // Handle free day checkbox change
  const handleFreeDayToggle = (event) => {
    setFreeDaySettings({
      ...freeDaySettings,
      enabled: event.target.checked
    });
  };

  // Handle free day frequency change
  const handleFrequencyChange = (event) => {
    setFreeDaySettings({
      ...freeDaySettings,
      frequency: event.target.value
    });
  };

  // Handle day of week change
  const handleDayOfWeekChange = (event) => {
    setFreeDaySettings({
      ...freeDaySettings,
      dayOfWeek: parseInt(event.target.value)
    });
  };

  // Calculate the total date range across all month periods with selected weeks
  const calculateTotalDateRange = () => {
    if (monthPeriods.length === 0) return null;

    let earliestDate = null;
    let latestDate = null;

    monthPeriods.forEach(month => {
      // Get the calendar data for this month
      const monthCalendarData = generateCalendarData(month.date, true, false);

      // Filter to only include selected weeks
      const filteredCalendarData = monthCalendarData.filter(week =>
        month.selectedWeeks.includes(week.weekNumber)
      );

      if (filteredCalendarData.length > 0) {
        // Find earliest and latest dates in this month's selected weeks
        filteredCalendarData.forEach(week => {
          week.days.forEach(day => {
            if (day.isCurrentMonth) {
              if (earliestDate === null || day.date.isBefore(earliestDate)) {
                earliestDate = day.date;
              }
              if (latestDate === null || day.date.isAfter(latestDate)) {
                latestDate = day.date;
              }
            }
          });
        });
      }
    });

    return { earliestDate, latestDate };
  };

  const dayHeaders = ['Ma', 'Di', 'Wo', 'Do', 'Vr'];
  if (showWeekends) {
    dayHeaders.push('Za', 'Zo');
  }

  // Find event, leave day, and sick day for a specific date
  const getEventsForDate = (date: dayjs.Dayjs) => {
    const formattedDate = date.format('YYYY-MM-DD');
    return events.filter(event => event.date === formattedDate);
  };

  const getLeaveDataForDate = (date: dayjs.Dayjs) => {
    const formattedDate = date.format('YYYY-MM-DD');
    return leaveData.filter(leave => leave.date === formattedDate);
  };

  const getSickDataForDate = (date: dayjs.Dayjs) => {
    const formattedDate = date.format('YYYY-MM-DD');
    return sickData.filter(sick => sick.date === formattedDate);
  };

  // Calculate special day hours
  const calculateSpecialHours = (dataArray) => {
    let total = 0;
    monthPeriods.forEach(month => {
      const startOfMonth = month.date.startOf('month');
      const endOfMonth = month.date.endOf('month');

      // Filter to only the days in selected weeks
      dataArray.forEach(item => {
        const itemDate = dayjs(item.date);

        // Check if date is in month AND in a selected week
        if (itemDate.isAfter(startOfMonth, 'day') &&
            itemDate.isBefore(endOfMonth, 'day') &&
            month.selectedWeeks.includes(itemDate.week())) {

          total += Number(item.hours) || 8;
        }
      });
    });
    return total;
  };

  const eventHours = calculateSpecialHours(events);
  const sickHours = calculateSpecialHours(sickData);
  const leaveHours = calculateSpecialHours(leaveData);

  // Calculate grand total across all periods
  const calculateGrandTotal = () => {
    let grandTotal = 0;

    monthPeriods.forEach(month => {
      // Generate full month calendar data
      const monthCalendarData = generateCalendarData(month.date, showWeekends, false);

      // Filter to only include selected weeks
      const filteredCalendarData = monthCalendarData.filter(week =>
        month.selectedWeeks.includes(week.weekNumber)
      );

      // Update with state hours
      const updatedCalendarData = updateCalendarWithState(filteredCalendarData, state);

      // Calculate total for this period
      grandTotal += calculateMonthTotal(updatedCalendarData);
    });

    return grandTotal;
  };

  const monthOptions = getMonthOptions();
  const dateRange = calculateTotalDateRange();
  const dateRangeText = dateRange && dateRange.earliestDate && dateRange.latestDate
    ? `${dateRange.earliestDate.format('DD MMM YYYY')} - ${dateRange.latestDate.format('DD MMM YYYY')}`
    : 'Geen datumbereik geselecteerd';

  return (
    <div className={classes.calendarContainer} key={updateKey}>
      {/* Free day settings at top (removed header) */}
      <Paper className={classes.freeDaySettings}>
        <div className={classes.freeDayRow}>
          <FormControlLabel
            control={
              <Checkbox
                checked={freeDaySettings.enabled}
                onChange={handleFreeDayToggle}
                name="enableFreeDay"
                color="primary"
              />
            }
            label="Vrije dag optie"
            style={{ marginRight: 16 }}
          />

          {freeDaySettings.enabled && (
            <>
              <Select
                value={freeDaySettings.frequency}
                onChange={handleFrequencyChange}
                style={{ marginRight: 8 }}
              >
                <MenuItem value="every">Elke week</MenuItem>
                <MenuItem value="odd">Oneven weken</MenuItem>
                <MenuItem value="even">Even weken</MenuItem>
              </Select>

              <Select
                value={freeDaySettings.dayOfWeek}
                onChange={handleDayOfWeekChange}
                style={{ marginLeft: 8 }}
              >
                <MenuItem value={1}>Maandag</MenuItem>
                <MenuItem value={2}>Dinsdag</MenuItem>
                <MenuItem value={3}>Woensdag</MenuItem>
                <MenuItem value={4}>Donderdag</MenuItem>
                <MenuItem value={5}>Vrijdag</MenuItem>
                <MenuItem value={6}>Zaterdag</MenuItem>
                <MenuItem value={0}>Zondag</MenuItem>
              </Select>
            </>
          )}

          <div className={classes.weekendToggle}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showWeekends}
                  onChange={onToggleWeekends}
                  name="showWeekends"
                  color="primary"
                />
              }
              label="Toon weekend dagen"
            />
          </div>
        </div>
      </Paper>

      {/* Date range header */}
      <div className={classes.dateRangeHeader}>
        <Typography variant="subtitle1">
          Geselecteerd bereik: {dateRangeText}
        </Typography>
      </div>

      {/* Render each month period */}
      {monthPeriods.map((month) => {
        // Generate full month calendar data
        const monthCalendarData = generateCalendarData(month.date, showWeekends, false);

        // Get all week numbers in this month
        const allWeeksInMonth = monthCalendarData.map(week => week.weekNumber);

        // Filter to only include selected weeks
        const filteredCalendarData = monthCalendarData.filter(week =>
          month.selectedWeeks.includes(week.weekNumber)
        );

        // Update with state hours
        const updatedCalendarData = updateCalendarWithState(filteredCalendarData, state);

        // Calculate total for this month
        const monthTotal = calculateMonthTotal(updatedCalendarData);

        // Define a safe month value for the Select
        const safeMonthValue = month.date.format('YYYY-MM-01');

        return (
          <Paper key={`${month.id}-${updateKey}`} style={{ marginBottom: 24, padding: 16 }}>
            <div className={classes.monthHeaderRow}>
              {/* Month selector and week toggles in same row */}
              <div className={classes.monthSelectorContainer}>
                <Select
                  value={safeMonthValue}
                  onChange={(e) => handleMonthChange(month.id, e.target.value as string)}
                  style={{ minWidth: 200 }}
                  className={classes.monthSelector}
                  renderValue={() => month.date.format('MMMM YYYY')}
                >
                  {monthOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
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

              {/* Week toggles - numbers only */}
              <div className={classes.weekToggleContainer}>
                {allWeeksInMonth.map(weekNumber => {
                  const isSelected = month.selectedWeeks.includes(weekNumber);

                  return (
                    <Chip
                      key={`${month.id}-week-${weekNumber}-${updateKey}`}
                      label={weekNumber}
                      color={isSelected ? "primary" : "default"}
                      onClick={() => handleToggleWeek(month.id, weekNumber)}
                      className={classes.weekChip}
                    />
                  );
                })}
              </div>
            </div>

            {/* Hours fill buttons */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <Typography variant="body2" style={{ marginRight: '8px' }}>
                Uren vullen voor deze maand:
              </Typography>
              <Button
                variant="outlined"
                className={classes.fillButton}
                style={{ marginRight: 8 }}
                onClick={() => handleQuickFill(0)}
              >
                0
              </Button>
              <Button
                variant="outlined"
                className={classes.fillButton}
                style={{ marginRight: 8 }}
                onClick={() => handleQuickFill(8)}
              >
                8
              </Button>
              <Button
                variant="outlined"
                className={classes.fillButton}
                onClick={() => handleQuickFill(9)}
              >
                9
              </Button>
            </div>

            {filteredCalendarData.length > 0 ? (
              <>
                {/* Day headers */}
                <div className={classes.weekRow}>
                  <div className={classes.weekNumberCell}>
                    <Typography variant="subtitle2">Week</Typography>
                  </div>
                  {dayHeaders.map((day, index) => (
                    <div key={`${index}-${updateKey}`} className={classes.dayHeader}>
                      <Typography variant="subtitle1">{day}</Typography>
                    </div>
                  ))}
                  <div className={classes.totalCell}>
                    <Typography variant="subtitle1">Totaal</Typography>
                  </div>
                </div>

                {/* Calendar weeks - only show selected weeks */}
                {updatedCalendarData.map((week, weekIndex) => (
                  <div key={`${month.id}-week-${weekIndex}-${updateKey}`} className={classes.weekRow}>
                    <div className={classes.weekNumberCell}>
                      <Typography variant="body1">{week.weekNumber}</Typography>
                    </div>
                    {week.days.map((day, dayIndex) => {
                      const dateEvents = getEventsForDate(day.date);
                      const dateLeaveData = getLeaveDataForDate(day.date);
                      const dateSickData = getSickDataForDate(day.date);

                      return (
                        <CalendarDay
                          key={`${month.id}-day-${dayIndex}-${updateKey}`}
                          day={day}
                          state={state}
                          events={dateEvents}
                          leaveData={dateLeaveData}
                          sickData={dateSickData}
                          onHoursChange={handleDayHoursChange}
                        />
                      );
                    })}
                    <div className={classes.totalCell}>
                      <Typography variant="h6">{calculateWeekTotal(week.days)}</Typography>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <Typography variant="body1" style={{ padding: 16, textAlign: 'center' }}>
                Geen weken geselecteerd voor deze maand
              </Typography>
            )}

            {filteredCalendarData.length > 0 && (
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Typography variant="h6">
                  Maand Totaal: {monthTotal}
                </Typography>
              </div>
            )}
          </Paper>
        );
      })}

      {/* Legend and add month button in the same row */}
      <div className={classes.legendAndButtonRow}>
        <div className={classes.summaryRow}>
          <div className={classes.summaryItem}>
            <div className={classes.summaryColor} style={{ backgroundColor: SICKNESS_COLOR }}></div>
            <Typography variant="body2" className={classes.summaryText}>Ziekte</Typography>
            <div className={classes.summaryHours}>
              <Typography variant="body2">{sickHours}</Typography>
            </div>
          </div>
          <div className={classes.summaryItem}>
            <div className={classes.summaryColor} style={{ backgroundColor: EVENT_COLOR }}></div>
            <Typography variant="body2" className={classes.summaryText}>Event</Typography>
            <div className={classes.summaryHours}>
              <Typography variant="body2">{eventHours}</Typography>
            </div>
          </div>
          <div className={classes.summaryItem}>
            <div className={classes.summaryColor} style={{ backgroundColor: VACATION_COLOR }}></div>
            <Typography variant="body2" className={classes.summaryText}>Verlof</Typography>
            <div className={classes.summaryHours}>
              <Typography variant="body2">{leaveHours}</Typography>
            </div>
          </div>
        </div>

        {/* Add month button moved to legend row */}
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddMonth}
          startIcon={<AddIcon />}
          className={classes.addMonthButton}
        >
          Maand toevoegen
        </Button>
      </div>

      {/* Total for all periods */}
      <div className={classes.monthTotal}>
        <Typography variant="h6" className={classes.monthTotalLabel}>
          {monthPeriods.length > 1 ? 'Totaal Alle Maanden:' : 'Maand Totaal:'}
        </Typography>
        <Typography variant="h4" className={classes.monthTotalValue}>
          {calculateGrandTotal()}
        </Typography>
      </div>
    </div>
  );
};
