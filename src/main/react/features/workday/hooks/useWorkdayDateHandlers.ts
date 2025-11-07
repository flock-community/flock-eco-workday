import { useCallback, MutableRefObject } from "react";
import dayjs from "dayjs";
import {
  WorkDayState,
  EventData,
  LeaveData,
  SickData,
} from "../enhanced/types";
import {
  isWeekend,
  isFreeDayDate,
  getEventHours,
  getLeaveHours,
  getSickHours,
} from "../utils/workdayHelpers";

interface UseWorkdayDateHandlersParams {
  state: WorkDayState | null;
  currentMonth: dayjs.Dayjs | null;
  events: EventData[];
  leaveData: LeaveData[];
  sickData: SickData[];
  initialMonthsRef: MutableRefObject<dayjs.Dayjs[] | null>;
  onStateChange: (state: WorkDayState) => void;
  onCurrentMonthChange: (month: dayjs.Dayjs) => void;
  onShowWeekendsChange: (show: boolean) => void;
}

interface UseWorkdayDateHandlersReturn {
  handleDayHoursChange: (
    date: dayjs.Dayjs,
    hours: number,
    type?: string
  ) => void;
  handleDateRangeChange: (
    from: dayjs.Dayjs,
    to: dayjs.Dayjs,
    resetDays?: boolean
  ) => void;
  handleQuickFill: (targetHours: number, targetMonth?: dayjs.Dayjs) => void;
  handleToggleWeekends: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleMonthsChange: (months: dayjs.Dayjs[]) => void;
}

export function useWorkdayDateHandlers({
  state,
  currentMonth,
  events,
  leaveData,
  sickData,
  initialMonthsRef,
  onStateChange,
  onCurrentMonthChange,
  onShowWeekendsChange,
}: UseWorkdayDateHandlersParams): UseWorkdayDateHandlersReturn {
  // Update hours for a specific day
  const handleDayHoursChange = useCallback(
    (date: dayjs.Dayjs, hours: number, type: string = "regular") => {
      if (!state) return;

      // Clone the current state to avoid direct mutation
      const newState = { ...state };

      if (type === "regular") {
        // Check if the date is within the current range
        const isWithinRange = date.isBetween(
          newState.from,
          newState.to,
          "day",
          "[]"
        );

        if (isWithinRange) {
          // Calculate the index in the days array
          const dayIndex = date.diff(newState.from, "day");

          // Update the existing day
          if (newState.days) {
            const newDays = [...newState.days];
            newDays[dayIndex] = hours;
            newState.days = newDays;
          } else {
            // Initialize days array if needed
            const dayCount = newState.to.diff(newState.from, "day") + 1;
            const newDays = Array(dayCount).fill(0);
            newDays[dayIndex] = hours;
            newState.days = newDays;
          }
        } else {
          // The date is outside the current range, we need to expand it
          let newFrom = newState.from;
          let newTo = newState.to;

          if (date.isBefore(newState.from)) {
            // Extend the range earlier
            newFrom = date;
          } else if (date.isAfter(newState.to)) {
            // Extend the range later
            newTo = date;
          }

          // Calculate the new day count
          const newDayCount = newTo.diff(newFrom, "day") + 1;

          // Create a new days array with all zeros
          const newDays = Array(newDayCount).fill(0);

          // Copy existing days data to the correct position in the new array
          if (newState.days) {
            const offset = newFrom.diff(newState.from, "day");

            for (let i = 0; i < newState.days.length; i++) {
              const newIndex = i - offset;
              if (newIndex >= 0 && newIndex < newDays.length) {
                newDays[newIndex] = newState.days[i];
              }
            }
          }

          // Set the hours for the clicked day
          const clickedDayIndex = date.diff(newFrom, "day");
          newDays[clickedDayIndex] = hours;

          // Update the state with the new range and days
          newState.from = newFrom;
          newState.to = newTo;
          newState.days = newDays;
        }

        // Update the state
        onStateChange(newState);
      }
    },
    [state, onStateChange]
  );

  // Handle date range change with resetDays parameter
  const handleDateRangeChange = useCallback(
    (from: dayjs.Dayjs, to: dayjs.Dayjs, resetDays: boolean = false) => {
      if (!state) return;

      console.log(
        "Date range change:",
        from ? from.format("YYYY-MM-DD") : "null",
        "to",
        to ? to.format("YYYY-MM-DD") : "null"
      );

      // Validate inputs - ensure we have valid dates
      if (!from || !to) {
        console.error("Invalid date range:", from, to);
        return;
      }

      // Ensure the range makes sense (from date is before or equal to to date)
      if (from.isAfter(to)) {
        console.error("Invalid date range: from date is after to date");
        return;
      }

      // Clone the current state to avoid direct mutation
      const newState = { ...state };

      // Calculate the new day count
      const newDayCount = to.diff(from, "day") + 1;

      // Sanity check to prevent creating a huge array
      if (newDayCount > 366) {
        console.warn("Very large date range detected:", newDayCount, "days");
      }

      // Create a new days array or use the existing one
      let newDays;

      if (resetDays) {
        // If resetDays is true, create a completely new days array filled with zeros
        // This will clear any existing hours data when switching months
        newDays = Array(newDayCount).fill(0);
      } else {
        if (newState.days) {
          // Handle both range expansion and reduction
          const oldDayCount = newState.days.length;
          newDays = Array(newDayCount).fill(0);

          // Map days from old range to new range
          const oldFrom = newState.from;

          for (let i = 0; i < newDayCount; i++) {
            const newDate = from.clone().add(i, "day");
            const oldIndex = newDate.diff(oldFrom, "day");

            // Only copy if the date was in the old range
            if (oldIndex >= 0 && oldIndex < oldDayCount) {
              newDays[i] = newState.days[oldIndex];
            }
          }
        } else {
          // If no days array exists, create a new one filled with zeros
          newDays = Array(newDayCount).fill(0);
        }
      }

      // Update the state with the new range and days
      newState.from = from;
      newState.to = to;
      newState.days = newDays;

      onStateChange(newState);

      // Update the months if necessary
      const allMonths = [];
      let currentDate = dayjs(from).startOf("month");
      const endDate = dayjs(to).endOf("month");

      while (currentDate.isSameOrBefore(endDate, "month")) {
        allMonths.push(dayjs(currentDate));
        currentDate = currentDate.add(1, "month");
      }

      if (allMonths.length > 0 && initialMonthsRef.current) {
        initialMonthsRef.current = allMonths;
        console.log(
          "Updated months based on new date range:",
          allMonths.map((m) => m.format("YYYY-MM"))
        );
      }
    },
    [state, initialMonthsRef, onStateChange]
  );

  // Improved quick fill - now supports targeting a specific month
  const handleQuickFill = useCallback(
    (targetHours: number, targetMonth?: dayjs.Dayjs) => {
      if (!state) return;

      // Clone the current state to avoid direct mutation
      const newState = { ...state };

      // Get the start and end of the target month, or use current month if not specified
      const monthDate = targetMonth || currentMonth;
      if (!monthDate) return;

      const startOfMonth = monthDate.startOf("month");
      const endOfMonth = monthDate.endOf("month");

      // Determine if we need to expand the date range to include the target month
      let newFrom = newState.from;
      let newTo = newState.to;
      let daysChanged = false;

      // If the current workday range doesn't cover the target month,
      // expand it to include the entire month
      if (startOfMonth.isBefore(newState.from)) {
        newFrom = startOfMonth;
        daysChanged = true;
      }

      if (endOfMonth.isAfter(newState.to)) {
        newTo = endOfMonth;
        daysChanged = true;
      }

      // If we expanded the date range, we need to rebuild the days array
      let newDays;
      if (daysChanged) {
        // Calculate the new day count
        const newDayCount = newTo.diff(newFrom, "day") + 1;

        // Create a new days array filled with zeros
        newDays = Array(newDayCount).fill(0);

        // Copy existing days data to the correct position in the new array
        if (newState.days) {
          const offset = newFrom.diff(newState.from, "day");

          for (let i = 0; i < newState.days.length; i++) {
            const newIndex = i - offset;
            if (newIndex >= 0 && newIndex < newDays.length) {
              newDays[newIndex] = newState.days[i];
            }
          }
        }

        // Update the state with the new range and days
        newState.from = newFrom;
        newState.to = newTo;
        newState.days = newDays;
      } else {
        // If we didn't expand the date range, just use the existing days array
        newDays = [...(newState.days || [])];

        // If days array is empty, initialize it
        if (newDays.length === 0) {
          const newDayCount = newTo.diff(newFrom, "day") + 1;
          newDays = Array(newDayCount).fill(0);
        }
      }

      // Now fill in the hours for each workday in the target month
      let currentDate = startOfMonth.clone();
      while (currentDate.isSameOrBefore(endOfMonth, "day")) {
        // Check if the date is within the workday range
        if (currentDate.isBetween(newState.from, newState.to, "day", "[]")) {
          // Get the index of this day in the days array
          const dayIndex = currentDate.diff(newState.from, "day");

          // Skip weekend days
          if (isWeekend(currentDate)) {
            if (dayIndex >= 0 && dayIndex < newDays.length) {
              newDays[dayIndex] = 0;
            }
          }
          // Skip free days
          else if (isFreeDayDate(currentDate)) {
            if (dayIndex >= 0 && dayIndex < newDays.length) {
              newDays[dayIndex] = 0;
            }
          }
          // Handle normal workdays
          else {
            // Calculate special hours for this day
            const eventHrs = getEventHours(currentDate, events);
            const leaveHrs = getLeaveHours(currentDate, leaveData);
            const sickHrs = getSickHours(currentDate, sickData);
            const totalSpecialHours = eventHrs + leaveHrs + sickHrs;

            if (dayIndex >= 0 && dayIndex < newDays.length) {
              // If there are special hours, handle them appropriately
              if (totalSpecialHours > 0) {
                // If special hours already exceed or equal the target, set to 0
                if (totalSpecialHours >= targetHours) {
                  newDays[dayIndex] = 0;
                } else {
                  // Otherwise, fill the remaining hours up to the target
                  newDays[dayIndex] = targetHours - totalSpecialHours;
                }
              } else {
                // Regular day with no special events, use the target hours
                newDays[dayIndex] = targetHours;
              }
            }
          }
        }

        // Move to the next day
        currentDate = currentDate.add(1, "day");
      }

      // Update the state with the new days array
      onStateChange({
        ...newState,
        days: newDays,
      });
    },
    [state, currentMonth, events, leaveData, sickData, onStateChange]
  );

  // Toggle weekend visibility
  const handleToggleWeekends = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onShowWeekendsChange(event.target.checked);
    },
    [onShowWeekendsChange]
  );

  // Handle updates to month list from CalendarGrid
  // This updates our reference to the current months without causing re-renders
  const handleMonthsChange = useCallback(
    (months: dayjs.Dayjs[]) => {
      if (months && months.length > 0 && initialMonthsRef.current) {
        // Create new dayjs instances to avoid reference issues
        initialMonthsRef.current = months.map((m) => dayjs(m));
        console.log(
          "Parent updated with months:",
          initialMonthsRef.current.map((m) => m.format("YYYY-MM"))
        );

        // If current month is not in the list, update it
        if (
          currentMonth &&
          !months.some((m) => m.isSame(currentMonth, "month"))
        ) {
          onCurrentMonthChange(months[0]);
        }
      }
    },
    [currentMonth, initialMonthsRef, onCurrentMonthChange]
  );

  return {
    handleDayHoursChange,
    handleDateRangeChange,
    handleQuickFill,
    handleToggleWeekends,
    handleMonthsChange,
  };
}
