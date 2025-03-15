import React, { useEffect, useState } from "react";
import { Typography, FormControlLabel, Checkbox, IconButton, Button, Select, MenuItem } from "@material-ui/core";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
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
}

// Interface for free day settings
interface FreeDaySettings {
  enabled: boolean;
  frequency: string; // 'every', 'odd', 'even'
  dayOfWeek: number; // 0-6, where 0 is Sunday, 1 is Monday, etc.
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
  onQuickFill
}) => {
  const classes = useStyles();
  // Add a local state to force re-renders when data changes
  const [updateKey, setUpdateKey] = useState(0);

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

  // Get calendar data
  const calendarData = generateCalendarData(currentMonth, showWeekends);
  const updatedCalendarData = state ? updateCalendarWithState(calendarData, state) : calendarData;
  const monthTotal = calculateMonthTotal(updatedCalendarData);

  // Calculate totals for events, sick days, and leave days for the month
  // Use the actual hours provided in each data item
  const eventHours = events
    .filter(e => {
      const eventDate = dayjs(e.date);
      return eventDate.month() === currentMonth.month() && eventDate.year() === currentMonth.year();
    })
    .reduce((sum, event) => sum + (Number(event.hours) || 8), 0);

  const sickHours = sickData
    .filter(s => {
      const sickDate = dayjs(s.date);
      return sickDate.month() === currentMonth.month() && sickDate.year() === currentMonth.year();
    })
    .reduce((sum, sick) => sum + (Number(sick.hours) || 8), 0);

  const leaveHours = leaveData
    .filter(l => {
      const leaveDate = dayjs(l.date);
      return leaveDate.month() === currentMonth.month() && leaveDate.year() === currentMonth.year();
    })
    .reduce((sum, leave) => sum + (Number(leave.hours) || 8), 0);

  // Listen for changes to state to force re-render for totals
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [state, events, leaveData, sickData]); // Also listen for changes to these arrays

  // Save free day settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('freeDaySettings', JSON.stringify(freeDaySettings));
  }, [freeDaySettings]);

  // Check if there are hours in the weekend days and show them automatically
  useEffect(() => {
    if (!showWeekends && state && state.days) {
      // Get the current month's start and end dates
      const startOfMonth = currentMonth.startOf('month');
      const endOfMonth = currentMonth.endOf('month');

      // Check each day in the period
      let dayIndex = 0;
      let currentDate = state.from;
      let hasWeekendHours = false;

      while (currentDate.isSameOrBefore(state.to, 'day') && dayIndex < state.days.length) {
        // Check if the day is in a weekend (6 = Saturday, 0 = Sunday)
        const dayOfWeek = currentDate.day();
        if ((dayOfWeek === 6 || dayOfWeek === 0) && state.days[dayIndex] > 0) {
          hasWeekendHours = true;
          break;
        }

        currentDate = currentDate.add(1, 'day');
        dayIndex++;
      }

      // If weekend hours found, show weekends automatically
      if (hasWeekendHours && !showWeekends) {
        // Create synthetic event to call the toggle function
        const syntheticEvent = {
          target: {
            checked: true
          }
        };
        onToggleWeekends(syntheticEvent);
      }
    }
  }, [state, currentMonth, showWeekends, onToggleWeekends]);

  const handlePreviousMonth = () => {
    onMonthChange(currentMonth.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    onMonthChange(currentMonth.add(1, 'month'));
  };

  const handleCurrentMonth = () => {
    onMonthChange(dayjs());
  };

  // Generate a list of years (current year -5 to current year +5)
  const currentYear = dayjs().year();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Handle year change
  const handleYearChange = (event) => {
    const newYear = parseInt(event.target.value);
    const newMonth = currentMonth.year(newYear);
    onMonthChange(newMonth);
  };

  // Create a wrapper for onDayHoursChange to trigger re-render
  const handleDayHoursChange = (date, hours, type = 'regular') => {
    onDayHoursChange(date, hours, type);
    // Force a re-render to update totals
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

  // Enhanced quick fill
  const handleEnhancedQuickFill = (hours: number) => {
    if (!state || !state.days) return;

    const newDays = [...state.days];

    for (let i = 0; i < newDays.length; i++) {
      const currentDate = state.from.add(i, 'day');
      const formattedDate = currentDate.format('YYYY-MM-DD');
      const dayOfWeek = currentDate.day();

      // Skip weekend days (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        newDays[i] = 0;
        continue;
      }

      // Skip if it's a free day
      if (isFreeDayDate(currentDate)) {
        newDays[i] = 0;
        continue;
      }

      // Check if it's an event, leave, or sick day
      const eventDay = events.find(e => e.date === formattedDate);
      const leaveDay = leaveData.find(l => l.date === formattedDate);
      const sickDay = sickData.find(s => s.date === formattedDate);

      if (eventDay || leaveDay || sickDay) {
        // Get the current hours for this special day
        const eventHours = eventDay ? Number(eventDay.hours) || 0 : 0;
        const leaveHours = leaveDay ? Number(leaveDay.hours) || 0 : 0;
        const sickHours = sickDay ? Number(sickDay.hours) || 0 : 0;

        // Calculate the existing hours (take the max of the overlapping events)
        const existingHours = Math.max(eventHours, leaveHours, sickHours);

        // If existing hours are less than the filling value, add the remaining hours
        if (existingHours < hours) {
          newDays[i] = hours - existingHours;
        } else {
          newDays[i] = 0;
        }
      } else {
        // Regular day
        newDays[i] = hours;
      }
    }

    // Update the state through the parent component
    onQuickFill(hours);

    // If we have the state object, we need to update it with our custom logic
    if (state && state.days) {
      const newState = { ...state, days: newDays };
      // We need to force the state update in the parent component
      if (typeof onDayHoursChange === 'function') {
        // Update the first day to trigger a state update
        // This is a bit of a hack, but it works to force the parent to update
        const firstDate = state.from;
        const firstDayHours = newDays[0];
        onDayHoursChange(firstDate, firstDayHours);

        // Update the rest of the days
        for (let i = 1; i < newDays.length; i++) {
          const date = state.from.add(i, 'day');
          onDayHoursChange(date, newDays[i]);
        }
      }
    }
  };

  // Toggle weekend visibility
  const handleToggleWeekends = (event) => {
    setShowWeekends(event.target.checked);
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

  return (
    <div className={classes.calendarContainer} key={updateKey}>
      <div className={classes.calendarHeader}>
        <div className={classes.navButtons}>
          <IconButton onClick={handlePreviousMonth}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="h4">
            {currentMonth.format('MMMM')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
            <NavigateNextIcon />
          </IconButton>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="outlined" onClick={handleCurrentMonth} className={classes.currentMonthButton}>
            huidige maand
          </Button>
          <Select
            value={currentMonth.year()}
            onChange={handleYearChange}
            className={classes.yearSelector}
          >
            {years.map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </div>

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

      <div className={classes.quickFillButtons}>
        <Button variant="outlined" onClick={() => onQuickFill(0)} style={{ marginRight: 8 }}>
          0
        </Button>
        <Button variant="outlined" onClick={() => handleEnhancedQuickFill(8)} style={{ marginRight: 8 }}>
          8
        </Button>
        <Button variant="outlined" onClick={() => handleEnhancedQuickFill(9)} style={{ marginRight: 8 }}>
          9
        </Button>

        {/* Free day settings */}
        <FormControlLabel
          control={
            <Checkbox
              checked={freeDaySettings.enabled}
              onChange={handleFreeDayToggle}
              name="enableFreeDay"
              color="primary"
            />
          }
          label="Vrije dag"
          style={{ marginLeft: 16 }}
        />

        {freeDaySettings.enabled && (
          <>
            <Select
              value={freeDaySettings.frequency}
              onChange={handleFrequencyChange}
              style={{ marginLeft: 8, marginRight: 8 }}
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
      </div>

      {/* Day headers */}
      <div className={classes.weekRow}>
        <div className={classes.weekNumberCell}>
          <Typography variant="subtitle2">Week</Typography>
        </div>
        {dayHeaders.map((day, index) => (
          <div key={index} className={classes.dayHeader}>
            <Typography variant="subtitle1">{day}</Typography>
          </div>
        ))}
        <div className={classes.totalCell}>
          <Typography variant="subtitle1">Totaal</Typography>
        </div>
      </div>

      {/* Calendar weeks */}
      {updatedCalendarData.map((week, weekIndex) => (
        <div key={weekIndex} className={classes.weekRow}>
          <div className={classes.weekNumberCell}>
            <Typography variant="body1">{week.weekNumber}</Typography>
          </div>
          {week.days.map((day, dayIndex) => {
            const dateEvents = getEventsForDate(day.date);
            const dateLeaveData = getLeaveDataForDate(day.date);
            const dateSickData = getSickDataForDate(day.date);

            return (
              <CalendarDay
                key={`${dayIndex}-${day.hours}-${updateKey}`}
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

      {/* Fill with buttons */}
      <div className={classes.fillWithButtons}>
        <Typography variant="body2" style={{ marginRight: '8px' }}>
          uren vullen met:
        </Typography>
        <div>
          <Button variant="outlined" className={classes.fillButton} onClick={() => onQuickFill(0)}>0</Button>
          <Button variant="outlined" className={classes.fillButton} onClick={() => handleEnhancedQuickFill(8)}>8</Button>
          <Button variant="outlined" className={classes.fillButton} onClick={() => handleEnhancedQuickFill(9)}>9</Button>

          {/* Free day settings */}
          <FormControlLabel
            control={
              <Checkbox
                checked={freeDaySettings.enabled}
                onChange={handleFreeDayToggle}
                name="enableFreeDay"
                color="primary"
              />
            }
            label="Vrije dag"
            style={{ marginLeft: 16 }}
          />

          {freeDaySettings.enabled && (
            <>
              <Select
                value={freeDaySettings.frequency}
                onChange={handleFrequencyChange}
                style={{ marginLeft: 8, marginRight: 8 }}
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
        </div>
      </div>

      {/* Legend with totals */}
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

      {/* Month total */}
      <div className={classes.monthTotal}>
        <Typography variant="h6" className={classes.monthTotalLabel}>
          Maand Totaal:
        </Typography>
        <Typography variant="h4" className={classes.monthTotalValue}>
          {monthTotal}
        </Typography>
      </div>
    </div>
  );
};
