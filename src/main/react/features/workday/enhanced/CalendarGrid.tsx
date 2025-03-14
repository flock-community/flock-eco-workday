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

  // Get calendar data
  const calendarData = generateCalendarData(currentMonth, showWeekends);
  const updatedCalendarData = state ? updateCalendarWithState(calendarData, state) : calendarData;
  const monthTotal = calculateMonthTotal(updatedCalendarData);

  // Calculate totals for events, sick days, and leave days for the month
  const eventHours = events
    .filter(e => {
      const eventDate = dayjs(e.date);
      return eventDate.month() === currentMonth.month() && eventDate.year() === currentMonth.year();
    })
    .reduce((sum, event) => sum + (event.hours || 8), 0);

  const sickHours = sickData
    .filter(s => {
      const sickDate = dayjs(s.date);
      return sickDate.month() === currentMonth.month() && sickDate.year() === currentMonth.year();
    })
    .reduce((sum, sick) => sum + (sick.hours || 8), 0);

  const leaveHours = leaveData
    .filter(l => {
      const leaveDate = dayjs(l.date);
      return leaveDate.month() === currentMonth.month() && leaveDate.year() === currentMonth.year();
    })
    .reduce((sum, leave) => sum + (leave.hours || 8), 0);

  // Listen for changes to state to force re-render for totals
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [state]);

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
        <Button variant="outlined" onClick={() => onQuickFill(8)} style={{ marginRight: 8 }}>
          8
        </Button>
        <Button variant="outlined" onClick={() => onQuickFill(9)} style={{ marginRight: 8 }}>
          9
        </Button>
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
                key={`${dayIndex}-${day.hours}`}
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
          <Button variant="outlined" className={classes.fillButton} onClick={() => onQuickFill(8)}>8</Button>
          <Button variant="outlined" className={classes.fillButton} onClick={() => onQuickFill(9)}>9</Button>
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
