import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { CalendarWeek, WorkDayState } from "./types";

// Extend dayjs with plugins
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

// Function to generate calendar data for the current month
export const generateCalendarData = (currentMonth: dayjs.Dayjs, showWeekends: boolean): CalendarWeek[] => {
  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  let calendarWeeks = [];
  let currentDate = startDate;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    const weekNumber = currentDate.isoWeek();
    const daysInWeek = [];

    for (let i = 0; i < 7; i++) {
      if (!showWeekends && (i === 5 || i === 6)) {
        currentDate = currentDate.add(1, 'day');
        continue;
      }

      const isCurrentMonth = currentDate.month() === currentMonth.month();

      daysInWeek.push({
        date: currentDate,
        isCurrentMonth,
        dayOfMonth: currentDate.date(),
        hours: 0, // Will be updated from state
      });

      currentDate = currentDate.add(1, 'day');
    }

    if (daysInWeek.some(day => day.isCurrentMonth)) {
      calendarWeeks.push({
        weekNumber,
        days: daysInWeek,
      });
    }
  }

  return calendarWeeks;
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

// Calculate total hours for the month
export const calculateMonthTotal = (calendarData) => {
  return calendarData.reduce((total, week) => {
    return total + calculateWeekTotal(week.days.filter(day => day.isCurrentMonth));
  }, 0);
};
