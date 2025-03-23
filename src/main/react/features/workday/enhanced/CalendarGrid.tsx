import React, { useEffect, useState, useCallback } from "react";
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
  onQuickFill: (hours: number, targetMonth?: dayjs.Dayjs) => void;
  onDateRangeChange?: (from: dayjs.Dayjs, to: dayjs.Dayjs, resetDays?: boolean) => void;
  onSelectedWeeksChange?: (weeks: number[]) => void; // NEW: Callback to track selected weeks
  values?: any;
  setFieldValue?: (field: string, value: any) => void;
  renderTrigger?: number; // Added to trigger re-render without recreating component
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
  onDateRangeChange,
  onSelectedWeeksChange, // NEW: Accept the callback
  renderTrigger = 0 // Default to 0 if not provided
}) => {
  const classes = useStyles();
  // Add a local state to force re-renders when data changes
  const [updateKey, setUpdateKey] = useState(0);
  // Multiple month periods
  const [monthPeriods, setMonthPeriods] = useState<MonthPeriod[]>([]);
  // Track if we're currently changing months to avoid infinite loops
  const [isChangingMonth, setIsChangingMonth] = useState(false);
  // Track previous month to detect changes
  const [prevMonthKey, setPrevMonthKey] = useState<string | null>(null);
  // Track if this is first load
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  // Track if this is a new workday
  const [isNewWorkday, setIsNewWorkday] = useState(true);
  // Track previous workday state to detect changes
  const [prevWorkdayKey, setPrevWorkdayKey] = useState<string | null>(null);

  // Free day settings state
  const [freeDaySettings, setFreeDaySettings] = useState<FreeDaySettings>(() => {
    // Try to load from localStorage
    const savedSettings = localStorage.getItem('freeDaySettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error("Error parsing free day settings:", e);
      }
    }
    return {
      enabled: false,
      frequency: 'every',
      dayOfWeek: 5 // Default to Friday
    };
  });

  // Helper to get week numbers for a month
  const getWeeksInMonth = (date: dayjs.Dayjs): number[] => {
    if (!date) return [];

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

  // Generate a unique key for the current workday state to track changes
  const generateWorkdayKey = (state: WorkDayState | null) => {
    if (!state) return null;

    // Use date ranges and a sample of hours to create a unique key
    const fromStr = state.from ? state.from.format('YYYY-MM-DD') : 'none';
    const toStr = state.to ? state.to.format('YYYY-MM-DD') : 'none';
    const hoursSample = state.days ? state.days.slice(0, 5).join(',') : 'none';

    return `${fromStr}-${toStr}-${hoursSample}`;
  };

  // Check if a specific week has any hours logged
  const hasHoursInWeek = (calendarWeek) => {
    if (!state || !state.days || state.days.length === 0) return false;

    for (const day of calendarWeek.days) {
      if (day.isCurrentMonth) {
        const dayIndex = day.date.diff(state.from, 'day');
        if (dayIndex >= 0 && dayIndex < state.days.length && state.days[dayIndex] > 0) {
          return true;
        }
      }
    }
    return false;
  };

  // Filter weeks that have hours
  const filterWeeksWithHours = (month) => {
    const calendarData = generateCalendarData(month, showWeekends, false);
    const weeksWithHours = calendarData
      .filter(week => hasHoursInWeek(week))
      .map(week => week.weekNumber);

    return weeksWithHours.length > 0 ? weeksWithHours : getWeeksInMonth(month);
  };

  // Initialize with a single month period based on currentMonth
  useEffect(() => {
    if (currentMonth && monthPeriods.length === 0) {
      // Ensure we use the start of the month to avoid date selection issues
      const firstOfMonth = currentMonth.startOf('month');
      const weeksInMonth = getWeeksInMonth(firstOfMonth);

      setMonthPeriods([{
        id: `month-${Date.now()}`,
        date: firstOfMonth,
        selectedWeeks: weeksInMonth // Start with all weeks selected
      }]);
    }
  }, [currentMonth, monthPeriods.length]);

  // Detect if workday is new or existing and track changes
  useEffect(() => {
    if (state) {
      // Check if this is a new workday (all hours are 0) or an existing one
      const noHours = !state.days || state.days.every(hour => hour === 0);
      setIsNewWorkday(noHours);

      // Generate a key to track changes to the workday
      const currentWorkdayKey = generateWorkdayKey(state);

      // If the workday has changed (switching between different workdays)
      if (prevWorkdayKey !== null && prevWorkdayKey !== currentWorkdayKey) {
        // Reset month periods when workday changes
        if (currentMonth) {
          const monthStart = currentMonth.startOf('month');
          setMonthPeriods([{
            id: `month-${Date.now()}`,
            date: monthStart,
            selectedWeeks: getWeeksInMonth(monthStart)
          }]);
        }
      }

      // Update previous workday tracker
      setPrevWorkdayKey(currentWorkdayKey);
    }
  }, [state, currentMonth, prevWorkdayKey]);

  // Handle month change detection
  useEffect(() => {
    if (!currentMonth) return;

    const currentMonthKey = currentMonth.format('YYYY-MM');

    // If month has changed
    if (prevMonthKey !== null && prevMonthKey !== currentMonthKey) {
      // When switching months, always show all weeks
      const weeksInMonth = getWeeksInMonth(currentMonth);

      setMonthPeriods(prev => prev.map(month => ({
        ...month,
        date: currentMonth.startOf('month'),
        selectedWeeks: weeksInMonth // Reset to all weeks when switching months
      })));
    }

    // Update previous month tracker
    setPrevMonthKey(currentMonthKey);
  }, [currentMonth, prevMonthKey]);

  // Filter weeks for existing workdays with hours
  useEffect(() => {
    // Only run this after initial load
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }

    // Skip for new workdays or month changes
    if (isNewWorkday || isChangingMonth) return;

    // Only apply for existing workdays with data
    if (state && state.days && currentMonth && !isChangingMonth) {
      // This is an existing workday with data
      if (!isNewWorkday) {
        // Filter weeks with hours
        const weeksWithHours = filterWeeksWithHours(currentMonth);

        // Update selected weeks
        setMonthPeriods(prev => prev.map(month => ({
          ...month,
          selectedWeeks: weeksWithHours
        })));
      }
    }
  }, [state, currentMonth, isFirstLoad, isNewWorkday, isChangingMonth]);

  // Stabilize the notify function to avoid re-renders
  const notifySelectedWeeksChange = useCallback(() => {
    if (!onSelectedWeeksChange) return;

    // Get all selected weeks from all month periods
    const allSelectedWeeks = monthPeriods.reduce((acc, month) => {
      return [...acc, ...month.selectedWeeks];
    }, [] as number[]);

    // Notify parent component
    onSelectedWeeksChange(allSelectedWeeks);
  }, [monthPeriods, onSelectedWeeksChange]);

  // Notify parent component when selected weeks change
  useEffect(() => {
    notifySelectedWeeksChange();
  }, [notifySelectedWeeksChange]);

  // Listen for changes to state to force re-render for totals
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [state, events, leaveData, sickData, monthPeriods, showWeekends, renderTrigger]);

  // Save free day settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('freeDaySettings', JSON.stringify(freeDaySettings));
    } catch (e) {
      console.error("Error saving free day settings:", e);
    }
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
  // Modified to handle separate year and month selections
  const handleYearMonthChange = (monthId: string, year: number, month: number) => {
    if (isChangingMonth) return; // Prevent re-entry

    setIsChangingMonth(true); // Set flag to prevent loops

    // Create a new date based on the selected year and month
    // Month is 0-based in dayjs (0 = January, 11 = December)
    const newDateObj = dayjs().year(year).month(month).startOf('month');
    const weeksInNewMonth = getWeeksInMonth(newDateObj);

    // Batch state updates
    setMonthPeriods(prev => prev.map(monthPeriod => {
      if (monthPeriod.id === monthId) {
        return {
          ...monthPeriod,
          date: newDateObj,
          selectedWeeks: weeksInNewMonth // Always show all weeks for newly selected month
        };
      }
      return monthPeriod;
    }));

    // Updating parent state needs to be delayed to avoid React batching issues
    setTimeout(() => {
      try {
        // Update the parent component's currentMonth state
        onMonthChange(newDateObj);

        // Also update the workday date range to match the new month's range
        if (onDateRangeChange) {
          const startOfMonth = newDateObj.startOf('month');
          const endOfMonth = newDateObj.endOf('month');
          onDateRangeChange(startOfMonth, endOfMonth, true);
        }
      } finally {
        // Make sure we reset the flag even if there's an error
        setIsChangingMonth(false);
      }
    }, 10);
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
        selectedWeeks: weeksInMonth // Select all weeks for new month
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

    // Save selected weeks to localStorage
    try {
      localStorage.setItem('monthPeriods', JSON.stringify(monthPeriods));
    } catch (e) {
      console.error('Failed to save month periods', e);
    }
  };

  // Generate selectors for years
  const getYearOptions = () => {
    const currentYear = dayjs().year();
    // Generate options for 3 years before and after current year
    return Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
  };

  // Generate selectors for months
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
      { value: 11, label: "December" }
    ];
  };

  // Create a wrapper for onDayHoursChange to trigger re-render
  const handleDayHoursChange = (date, hours, type = 'regular') => {
    onDayHoursChange(date, hours, type);
    // Force a re-render to update totals
    setUpdateKey(prev => prev + 1);
  };

  // Simple fill button handler - now with month-specific targeting
  const handleQuickFill = (hours, monthId) => {
    // Find the specific month to fill
    const targetMonthObj = monthPeriods.find(m => m.id === monthId);
    if (!targetMonthObj) {
      console.error('Could not find target month for filling');
      return;
    }

    // Pass the specific month date to the parent handler
    onQuickFill(hours, targetMonthObj.date);

    // Force component to re-render with new state
    setUpdateKey(prev => prev + 1);
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

  const yearOptions = getYearOptions();
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

        // Get current year and month from the date
        const currentYear = month.date.year();
        const currentMonthIndex = month.date.month(); // 0-based index

        return (
          <Paper key={`${month.id}-${updateKey}`} style={{ marginBottom: 24, padding: 16 }}>
            <div className={classes.monthHeaderRow}>
              {/* Month selector and week toggles in same row */}
              <div className={classes.monthSelectorContainer}>
                {/* Year selector */}
                <Select
                  value={currentYear}
                  onChange={(e) => handleYearMonthChange(month.id, e.target.value as number, currentMonthIndex)}
                  className={classes.yearSelector}
                >
                  {yearOptions.map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>

                {/* Month selector */}
                <Select
                  value={currentMonthIndex}
                  onChange={(e) => handleYearMonthChange(month.id, currentYear, e.target.value as number)}
                  style={{ minWidth: 150, marginLeft: 8 }}
                  className={classes.monthSelector}
                >
                  {monthOptions.map(month => (
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
                onClick={() => handleQuickFill(0, month.id)}
              >
                0
              </Button>
              <Button
                variant="outlined"
                className={classes.fillButton}
                style={{ marginRight: 8 }}
                onClick={() => handleQuickFill(8, month.id)}
              >
                8
              </Button>
              <Button
                variant="outlined"
                className={classes.fillButton}
                onClick={() => handleQuickFill(9, month.id)}
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
