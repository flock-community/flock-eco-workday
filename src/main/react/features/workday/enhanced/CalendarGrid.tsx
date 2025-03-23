import React, { useEffect, useState, useCallback, useRef } from "react";
import { Typography, FormControlLabel, Checkbox, IconButton, Button, Select, MenuItem, Grid, Divider, Paper } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
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
  onSelectedWeeksChange?: (weeks: number[]) => void;
  initialMonths?: dayjs.Dayjs[]; // NEW: Optional prop for initial months
  onMonthsChange?: (months: dayjs.Dayjs[]) => void; // NEW: Optional callback for month changes
  values?: any;
  setFieldValue?: (field: string, value: any) => void;
  renderTrigger?: number;
}

// Interface for free day settings
interface FreeDaySettings {
  enabled: boolean;
  frequency: string;
  dayOfWeek: number;
}

// Interface for a month period
interface MonthPeriod {
  id: string;
  date: dayjs.Dayjs;
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
  renderTrigger = 0
}) => {
  const classes = useStyles();
  const [updateKey, setUpdateKey] = useState(0);
  const [monthPeriods, setMonthPeriods] = useState<MonthPeriod[]>([]);
  
  // Track initialization state to prevent double initialization
  const initializedRef = useRef(false);
  // Track month changes to prevent infinite loops
  const reportedMonthsRef = useRef<string>("");
  // For debugging
  const logRef = useRef(false);

  // Free day settings state
  const [freeDaySettings, setFreeDaySettings] = useState<FreeDaySettings>(() => {
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
      dayOfWeek: 5
    };
  });

  // Helper function to get all week numbers for a month
  const getWeeksInMonth = (month: dayjs.Dayjs): number[] => {
    if (!month) return [];

    const startOfMonth = month.startOf('month');
    const endOfMonth = month.endOf('month');
    const weeks = new Set<number>();

    let current = startOfMonth;
    while (current.isSameOrBefore(endOfMonth)) {
      weeks.add(current.week());
      current = current.add(1, 'day');
    }

    return Array.from(weeks).sort((a, b) => a - b);
  };

  // Initialize month periods based on initialMonths or currentMonth
  useEffect(() => {
    // Log changes in key inputs that would affect initialization
    if (!logRef.current) {
      console.log("CalendarGrid initializing with months:", 
                  initialMonths ? initialMonths.map(m => m.format('YYYY-MM')) : 'none',
                  "Current month:", currentMonth ? currentMonth.format('YYYY-MM') : 'none',
                  "State from/to:", state?.from?.format('YYYY-MM-DD'), "/", state?.to?.format('YYYY-MM-DD'));
      logRef.current = true;
    }
    
    // Get months from state date range if available
    if (state && state.from && state.to) {
      // Extract all months from the state's date range
      const months = [];
      let current = dayjs(state.from).startOf('month');
      const end = dayjs(state.to).endOf('month');
      
      // Add all months in the date range
      while (current.isSameOrBefore(end, 'month')) {
        months.push(dayjs(current));
        current = current.add(1, 'month');
      }
      
      if (months.length > 0) {
        // Only update if the months have actually changed
        const newMonthsStr = months.map(m => m.format('YYYY-MM')).join(',');
        const currentMonthsStr = monthPeriods.map(p => p.date.format('YYYY-MM')).join(',');
        
        if (newMonthsStr !== currentMonthsStr) {
          const newMonthPeriods = months.map((month, index) => ({
            id: `month-${Date.now()}-${index}`,
            date: month
          }));
          
          setMonthPeriods(newMonthPeriods);
          initializedRef.current = true;
          console.log("Updated with", newMonthPeriods.length, "months from state date range");
          return;
        }
      }
    }
    
    // If no state date range or no change detected, check initialMonths
    if (!initializedRef.current) {
      // Initialize from provided initial months if available
      if (initialMonths && initialMonths.length > 0) {
        console.log("Using initialMonths:", initialMonths.map(m => m.format('YYYY-MM')));
        const newMonthPeriods = initialMonths.map((month, index) => ({
          id: `month-${Date.now()}-${index}`,
          date: dayjs(month).startOf('month')
        }));
        
        setMonthPeriods(newMonthPeriods);
        initializedRef.current = true;
        console.log("Initialized with", newMonthPeriods.length, "months from initialMonths");
        return;
      }
      
      // Fall back to currentMonth if no initialMonths provided or they were empty
      if (currentMonth && monthPeriods.length === 0) {
        const newId = `month-${Date.now()}`;
        setMonthPeriods([{
          id: newId,
          date: dayjs(currentMonth).startOf('month')
        }]);
        initializedRef.current = true;
        console.log("Initialized with current month fallback");
        return;
      }
    }
  }, [initialMonths, currentMonth, monthPeriods.length, state]);

  // Notify parent component of month changes, but only when they actually change
  // and avoid infinite loops by using a ref to track the last reported state
  useEffect(() => {
    if (!onMonthsChange || monthPeriods.length === 0) return;
    
    // Create a string representation of the current months to compare with previous
    const monthsString = monthPeriods.map(p => p.date.format('YYYY-MM')).join(',');
    
    // Only report changes if the months have actually changed
    if (reportedMonthsRef.current !== monthsString) {
      // Log the change for debugging
      console.log("Months changed from", reportedMonthsRef.current, "to", monthsString);
      
      // Create completely new dayjs instances for each month to prevent reference issues
      const months = monthPeriods.map(period => dayjs(period.date));
      onMonthsChange(months);
      reportedMonthsRef.current = monthsString;
    }
  }, [monthPeriods, onMonthsChange]);

  // Notify parent of all weeks to include for saving
  useEffect(() => {
    if (!onSelectedWeeksChange || monthPeriods.length === 0) return;

    // Get all weeks from all months
    const allWeeks = monthPeriods.reduce((acc, month) => {
      return [...acc, ...getWeeksInMonth(month.date)];
    }, [] as number[]);

    // Make sure weeks are unique
    const uniqueWeeks = [...new Set(allWeeks)].sort((a, b) => a - b);

    // Notify parent
    onSelectedWeeksChange(uniqueWeeks);
  }, [monthPeriods, onSelectedWeeksChange]);

  // Force re-render on data changes
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [state, events, leaveData, sickData, showWeekends, renderTrigger]);

  // Save free day settings
  useEffect(() => {
    try {
      localStorage.setItem('freeDaySettings', JSON.stringify(freeDaySettings));
    } catch (e) {
      console.error("Error saving free day settings:", e);
    }
  }, [freeDaySettings]);

  // Reset the initialization flag when key props change
  useEffect(() => {
    // If initialMonths change, we should re-initialize
    if (initialMonths && initialMonths.length > 0) {
      // Create a string representation of initialMonths for comparison
      const monthsString = initialMonths.map(m => m.format('YYYY-MM')).join(',');
      const currentMonthsString = monthPeriods.map(p => p.date.format('YYYY-MM')).join(',');
      
      // Only re-initialize if the months have actually changed
      if (monthsString !== currentMonthsString) {
        initializedRef.current = false;
        console.log("Reset initialization flag due to changed initialMonths");
      }
    }
    
    return () => {
      initializedRef.current = false;
      logRef.current = false;
    };
  }, [initialMonths, monthPeriods]);

  // Month selection handlers
  const handleYearMonthChange = (monthId: string, year: number, month: number) => {
    // Create a completely new dayjs object to avoid reference issues
    const newDate = dayjs().year(year).month(month).startOf('month');

    // Update month periods
    setMonthPeriods(prev => prev.map(period => {
      if (period.id === monthId) {
        return {
          ...period,
          date: dayjs(newDate) // Create new instance to prevent reference issues
        };
      }
      return period;
    }));
  };

  // Add new month
  const handleAddMonth = () => {
    if (monthPeriods.length === 0) return;

    const lastMonth = monthPeriods[monthPeriods.length - 1];
    // Create a new completely independent dayjs object
    const newDate = dayjs(lastMonth.date).add(1, 'month').startOf('month');
    const newId = `month-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate the new date range to notify parent
    if (onDateRangeChange && state) {
      // Find earliest and latest dates in current months
      let earliestDate = state.from;
      let latestDate = state.to;
      
      // Check if the new month extends beyond the current range
      const newMonthStart = newDate.startOf('month');
      const newMonthEnd = newDate.endOf('month');
      
      // If the new month extends the range, update it
      if (newMonthEnd.isAfter(latestDate)) {
        console.log("Extending date range to include new month:", newMonthEnd.format('YYYY-MM-DD'));
        onDateRangeChange(earliestDate, newMonthEnd, false);
      }
    }

    // Add the new month to the periods
    setMonthPeriods(prev => [
      ...prev,
      {
        id: newId,
        date: newDate
      }
    ]);
    
    console.log("Added new month:", newDate.format('YYYY-MM'));
  };

  // Remove month
  const handleRemoveMonth = (monthId: string) => {
    setMonthPeriods(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(month => month.id !== monthId);
    });
  };

  // Handle day hours change
  const handleDayHoursChange = (date, hours, type = 'regular') => {
    onDayHoursChange(date, hours, type);
    setUpdateKey(prev => prev + 1);
  };

  // Quick fill hours for a specific month
  const handleQuickFill = (hours, monthId) => {
    // Find the month period by ID
    const monthPeriod = monthPeriods.find(period => period.id === monthId);
    
    if (!monthPeriod) return;
    
    // Get the month date from the period
    const targetMonth = monthPeriod.date.clone();
    
    // Call the parent component's onQuickFill with the target month
    onQuickFill(hours, targetMonth);
    
    // Force re-render after filling
    setUpdateKey(prev => prev + 1);
  };

  // Free day settings handlers
  const handleFreeDayToggle = (event) => {
    setFreeDaySettings(prev => ({
      ...prev,
      enabled: event.target.checked
    }));
  };

  const handleFrequencyChange = (event) => {
    setFreeDaySettings(prev => ({
      ...prev,
      frequency: event.target.value
    }));
  };

  const handleDayOfWeekChange = (event) => {
    setFreeDaySettings(prev => ({
      ...prev,
      dayOfWeek: parseInt(event.target.value)
    }));
  };

  // Check if a date is a free day
  const isFreeDayDate = (date: dayjs.Dayjs): boolean => {
    if (!freeDaySettings.enabled) return false;
    if (date.day() !== freeDaySettings.dayOfWeek) return false;

    if (freeDaySettings.frequency === 'every') {
      return true;
    } else if (freeDaySettings.frequency === 'odd') {
      return date.week() % 2 !== 0;
    } else if (freeDaySettings.frequency === 'even') {
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

    monthPeriods.forEach(month => {
      // Get the first and last day of each month
      const firstDay = month.date.startOf('month');
      const lastDay = month.date.endOf('month');
      
      if (earliestDate === null || firstDay.isBefore(earliestDate)) {
        earliestDate = firstDay;
      }
      
      if (latestDate === null || lastDay.isAfter(latestDate)) {
        latestDate = lastDay;
      }
    });
    
    // Handle case where state has a wider range than visible months
    if (state && state.from && state.to) {
      if (earliestDate === null || state.from.isBefore(earliestDate)) {
        earliestDate = state.from;
      }
      
      if (latestDate === null || state.to.isAfter(latestDate)) {
        latestDate = state.to;
      }
    }

    return { earliestDate, latestDate };
  };

  // Helper functions for displaying events/leave/sick data
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

  // Calculate special hours (events, leave, sick)
  const calculateSpecialHours = (dataArray) => {
    let total = 0;

    monthPeriods.forEach(month => {
      const startOfMonth = month.date.startOf('month');
      const endOfMonth = month.date.endOf('month');

      dataArray.forEach(item => {
        const itemDate = dayjs(item.date);

        if (itemDate.isAfter(startOfMonth, 'day') &&
            itemDate.isBefore(endOfMonth, 'day')) {
          total += Number(item.hours) || 8;
        }
      });
    });

    return total;
  };

  // Calculate totals
  const eventHours = calculateSpecialHours(events);
  const sickHours = calculateSpecialHours(sickData);
  const leaveHours = calculateSpecialHours(leaveData);

  const calculateGrandTotal = () => {
    let total = 0;

    monthPeriods.forEach(month => {
      const monthCalendarData = generateCalendarData(month.date, showWeekends, false);
      const updatedCalendarData = updateCalendarWithState(monthCalendarData, state);
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
      { value: 11, label: "December" }
    ];
  };

  const yearOptions = getYearOptions();
  const monthOptions = getMonthOptions();
  const dateRange = calculateTotalDateRange();
  const dateRangeText = dateRange && dateRange.earliestDate && dateRange.latestDate
    ? `${dateRange.earliestDate.format('DD MMM YYYY')} - ${dateRange.latestDate.format('DD MMM YYYY')}`
    : 'Geen datumbereik geselecteerd';

  const dayHeaders = ['Ma', 'Di', 'Wo', 'Do', 'Vr'];
  if (showWeekends) {
    dayHeaders.push('Za', 'Zo');
  }

  return (
    <div className={classes.calendarContainer} key={updateKey}>
      {/* Free day settings */}
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
        const monthCalendarData = generateCalendarData(month.date, showWeekends, false);
        const updatedCalendarData = updateCalendarWithState(monthCalendarData, state);
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
                  onChange={(e) => handleYearMonthChange(month.id, e.target.value as number, currentMonthIndex)}
                  className={classes.yearSelector}
                >
                  {yearOptions.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
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
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
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

            {/* Calendar display */}
            {updatedCalendarData.length > 0 ? (
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

                {/* Calendar weeks - now showing all weeks */}
                {updatedCalendarData.map((week, weekIndex) => (
                  <div key={`${month.id}-week-${weekIndex}-${updateKey}`} className={classes.weekRow}>
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
                        onHoursChange={handleDayHoursChange}
                      />
                    ))}
                    <div className={classes.totalCell}>
                      <Typography variant="h6">{calculateWeekTotal(week.days)}</Typography>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <Typography variant="body1" style={{ padding: 16, textAlign: 'center' }}>
                Geen weken beschikbaar voor deze maand
              </Typography>
            )}

            {updatedCalendarData.length > 0 && (
              <div style={{ textAlign: 'right', marginTop: 16 }}>
                <Typography variant="h6">
                  Maand Totaal: {monthTotal}
                </Typography>
              </div>
            )}
          </Paper>
        );
      })}

      {/* Legend and add month button */}
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
