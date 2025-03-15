import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { CalendarWeek, WorkDayState } from "./types";

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

// Function to generate calendar data for a specific period
export const generateCalendarData = (
  currentDate: dayjs.Dayjs,
  showWeekends: boolean,
  isWeekView: boolean = false
): CalendarWeek[] => {
  let startDate, endDate;

  if (isWeekView) {
    // Week view - show only one week
    startDate = currentDate.startOf('week');
    endDate = currentDate.endOf('week');
  } else {
    // Month view - show all weeks in the month
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    startDate = startOfMonth.startOf('week');
    endDate = endOfMonth.endOf('week');
  }

  let calendarWeeks = [];
  let currentDateInLoop = startDate;

  while (currentDateInLoop.isBefore(endDate) || currentDateInLoop.isSame(endDate, 'day')) {
    const weekNumber = currentDateInLoop.isoWeek();
    const daysInWeek = [];

    for (let i = 0; i < 7; i++) {
      if (!showWeekends && (i === 5 || i === 6)) {
        currentDateInLoop = currentDateInLoop.add(1, 'day');
        continue;
      }

      // For week view, all days are considered "current"
      const isCurrentMonth = isWeekView ? true : currentDateInLoop.month() === currentDate.month();

      daysInWeek.push({
        date: currentDateInLoop,
        isCurrentMonth,
        dayOfMonth: currentDateInLoop.date(),
        hours: 0, // Will be updated from state
      });

      currentDateInLoop = currentDateInLoop.add(1, 'day');
    }

    // For month view, only include weeks that have days in the current month
    // For week view, always include the week
    if (isWeekView || daysInWeek.some(day => day.isCurrentMonth)) {
      calendarWeeks.push({
        weekNumber,
        days: daysInWeek,
      });
    }

    // For week view, we only need one week
    if (isWeekView && calendarWeeks.length > 0) {
      break;
    }
  }

  return calendarWeeks;
};

// Generate calendar data for multiple periods
export const generateMultiPeriodCalendarData = (
  startDate: dayjs.Dayjs,
  endDate: dayjs.Dayjs,
  showWeekends: boolean,
  isWeekView: boolean = false
): { date: dayjs.Dayjs, weeks: CalendarWeek[] }[] => {
  const periods = [];
  const interval = isWeekView ? 'week' : 'month';

  // Clone the start date to avoid mutations
  let currentDate = dayjs(startDate);

  // Generate calendar data for each period in the range
  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, interval)) {
    periods.push({
      date: currentDate,
      weeks: generateCalendarData(currentDate, showWeekends, isWeekView)
    });

    // Move to next period
    currentDate = currentDate.add(1, interval);
  }

  return periods;
};

// Function to update calendar data with hours from state
export const updateCalendarWithState = (calendarData: CalendarWeek[], state: WorkDayState | null): CalendarWeek[] => {
  if (!state || !state.days) return calendarData;

  const { from, to, days } = state;

  return calendarData.map(week => {
    const updatedDays = week.days.map(day => {
      const currentDate = day.date;
      // Check if the day is within the workday period
      if (currentDate.isBetween(from, to, 'day', '[]')) {
        // Calculate the index in the days array
        const dayIndex = currentDate.diff(from, 'day');

        // Only update if the index is valid (within the days array)
        if (dayIndex >= 0 && dayIndex < days.length) {
          return {
            ...day,
            hours: days[dayIndex] || 0,
          };
        }
      }
      return day;
    });

    return {
      ...week,
      days: updatedDays,
    };
  });
};

// Calculate total hours for a week
export const calculateWeekTotal = (days) => {
  return days.reduce((total, day) => total + (day.hours || 0), 0);
};

// Calculate total hours for the month or week
export const calculateMonthTotal = (calendarData) => {
  return calendarData.reduce((total, week) => {
    return total + calculateWeekTotal(week.days.filter(day => day.isCurrentMonth));
  }, 0);
};
