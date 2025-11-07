import dayjs from "dayjs";
import { WorkDayState } from "../enhanced/types";
import { MonthPeriod } from "../hooks/useMonthPeriods";
import {
  generateCalendarData,
  updateCalendarWithState,
  calculateMonthTotal,
} from "../enhanced/calendarUtils";

interface DataItem {
  date: string;
  hours: number;
  description?: string;
  status?: string;
}

interface OverlapData {
  hours: number;
  description: string;
}

/**
 * Helper functions for filtering data by date
 */
export const getEventsForDate = (
  date: dayjs.Dayjs,
  events: DataItem[]
): DataItem[] => {
  const formattedDate = date.format("YYYY-MM-DD");
  return events.filter((event) => event.date === formattedDate);
};

export const getLeaveDataForDate = (
  date: dayjs.Dayjs,
  leaveData: DataItem[]
): DataItem[] => {
  const formattedDate = date.format("YYYY-MM-DD");
  return leaveData.filter((leave) => leave.date === formattedDate);
};

export const getSickDataForDate = (
  date: dayjs.Dayjs,
  sickData: DataItem[]
): DataItem[] => {
  const formattedDate = date.format("YYYY-MM-DD");
  return sickData.filter((sick) => sick.date === formattedDate);
};

/**
 * Function to detect overlapping workdays for a specific date
 */
export const getOverlappingWorkdaysForDate = (
  date: dayjs.Dayjs,
  state: WorkDayState | null,
  overlappingWorkdays: WorkDayState[]
): OverlapData[] => {
  if (!state || overlappingWorkdays.length === 0) return [];

  const overlaps: OverlapData[] = [];

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

/**
 * Calculate special hours (events, leave, sick) for the month periods
 */
export const calculateSpecialHours = (
  dataArray: DataItem[],
  monthPeriods: MonthPeriod[]
): number => {
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

/**
 * Calculate overlapping hours for the current month periods
 */
export const calculateOverlappingHours = (
  monthPeriods: MonthPeriod[],
  state: WorkDayState | null,
  overlappingWorkdays: WorkDayState[]
): number => {
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
        const overlaps = getOverlappingWorkdaysForDate(
          currentDay,
          state,
          overlappingWorkdays
        );

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

/**
 * Calculate the grand total hours across all month periods
 */
export const calculateGrandTotal = (
  monthPeriods: MonthPeriod[],
  showWeekends: boolean,
  state: WorkDayState | null
): number => {
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

/**
 * Calculate the total date range from month periods
 */
export const calculateTotalDateRange = (
  monthPeriods: MonthPeriod[],
  state: WorkDayState | null,
  onDateRangeChange?: (
    from: dayjs.Dayjs,
    to: dayjs.Dayjs,
    resetDays?: boolean
  ) => void
): {
  earliestDate: dayjs.Dayjs | null;
  latestDate: dayjs.Dayjs | null;
} | null => {
  if (monthPeriods.length === 0) return null;

  // Simple calculation based on month periods
  let earliestDate: dayjs.Dayjs | null = null;
  let latestDate: dayjs.Dayjs | null = null;

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

/**
 * Get year options for the year selector dropdown
 */
export const getYearOptions = (): number[] => {
  const currentYear = dayjs().year();
  return Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);
};

/**
 * Get month options for the month selector dropdown
 */
export const getMonthOptions = (): Array<{ value: number; label: string }> => {
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
