import { useState, useEffect, useRef, useCallback } from "react";
import dayjs from "dayjs";
import { WorkDayState } from "../enhanced/types";

// Interface for a month period
export interface MonthPeriod {
  id: string;
  date: dayjs.Dayjs;
}

interface UseMonthPeriodsProps {
  initialMonths?: dayjs.Dayjs[];
  currentMonth: dayjs.Dayjs;
  state: WorkDayState | null;
  onMonthsChange?: (months: dayjs.Dayjs[]) => void;
  onSelectedWeeksChange?: (weeks: number[]) => void;
  onDateRangeChange?: (
    from: dayjs.Dayjs,
    to: dayjs.Dayjs,
    resetDays?: boolean
  ) => void;
}

interface UseMonthPeriodsReturn {
  monthPeriods: MonthPeriod[];
  handleYearMonthChange: (monthId: string, year: number, month: number) => void;
  handleAddMonth: () => void;
  handleRemoveMonth: (monthId: string) => void;
  getWeeksInMonth: (month: dayjs.Dayjs) => number[];
}

export const useMonthPeriods = ({
  initialMonths,
  currentMonth,
  state,
  onMonthsChange,
  onSelectedWeeksChange,
  onDateRangeChange,
}: UseMonthPeriodsProps): UseMonthPeriodsReturn => {
  const [monthPeriods, setMonthPeriods] = useState<MonthPeriod[]>([]);

  // Track initialization state to prevent double initialization
  const initializedRef = useRef(false);
  // Track month changes to prevent infinite loops
  const reportedMonthsRef = useRef<string>("");
  // For debugging
  const logRef = useRef(false);

  // Helper function to get all week numbers for a month
  const getWeeksInMonth = useCallback((month: dayjs.Dayjs): number[] => {
    if (!month) return [];

    const startOfMonth = month.startOf("month");
    const endOfMonth = month.endOf("month");
    const weeks = new Set<number>();

    let current = startOfMonth;
    while (current.isSameOrBefore(endOfMonth)) {
      weeks.add(current.week());
      current = current.add(1, "day");
    }

    return Array.from(weeks).sort((a, b) => a - b);
  }, []);

  // Initialize month periods based on initialMonths or currentMonth
  useEffect(() => {
    // Log changes in key inputs that would affect initialization
    if (!logRef.current) {
      console.log(
        "CalendarGrid initializing with months:",
        initialMonths ? initialMonths.map((m) => m.format("YYYY-MM")) : "none",
        "Current month:",
        currentMonth ? currentMonth.format("YYYY-MM") : "none",
        "State from/to:",
        state?.from?.format("YYYY-MM-DD"),
        "/",
        state?.to?.format("YYYY-MM-DD")
      );
      logRef.current = true;
    }

    // Get months from state date range if available
    if (state && state.from && state.to) {
      // Extract all months from the state's date range
      const months = [];
      let current = dayjs(state.from).startOf("month");
      const end = dayjs(state.to).endOf("month");

      // Add all months in the date range
      while (current.isSameOrBefore(end, "month")) {
        months.push(dayjs(current));
        current = current.add(1, "month");
      }

      if (months.length > 0) {
        // Only update if the months have actually changed
        const newMonthsStr = months.map((m) => m.format("YYYY-MM")).join(",");
        const currentMonthsStr = monthPeriods
          .map((p) => p.date.format("YYYY-MM"))
          .join(",");

        if (newMonthsStr !== currentMonthsStr) {
          const newMonthPeriods = months.map((month, index) => ({
            id: `month-${Date.now()}-${index}`,
            date: month,
          }));

          setMonthPeriods(newMonthPeriods);
          initializedRef.current = true;
          console.log(
            "Updated with",
            newMonthPeriods.length,
            "months from state date range"
          );
          return;
        }
      }
    }

    // If no state date range or no change detected, check initialMonths
    if (!initializedRef.current) {
      // Initialize from provided initial months if available
      if (initialMonths && initialMonths.length > 0) {
        console.log(
          "Using initialMonths:",
          initialMonths.map((m) => m.format("YYYY-MM"))
        );
        const newMonthPeriods = initialMonths.map((month, index) => ({
          id: `month-${Date.now()}-${index}`,
          date: dayjs(month).startOf("month"),
        }));

        setMonthPeriods(newMonthPeriods);
        initializedRef.current = true;
        console.log(
          "Initialized with",
          newMonthPeriods.length,
          "months from initialMonths"
        );
        return;
      }

      // Fall back to currentMonth if no initialMonths provided or they were empty
      if (currentMonth && monthPeriods.length === 0) {
        const newId = `month-${Date.now()}`;
        setMonthPeriods([
          {
            id: newId,
            date: dayjs(currentMonth).startOf("month"),
          },
        ]);
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
    const monthsString = monthPeriods
      .map((p) => p.date.format("YYYY-MM"))
      .join(",");

    // Only report changes if the months have actually changed
    if (reportedMonthsRef.current !== monthsString) {
      // Log the change for debugging
      console.log(
        "Months changed from",
        reportedMonthsRef.current,
        "to",
        monthsString
      );

      // Create completely new dayjs instances for each month to prevent reference issues
      const months = monthPeriods.map((period) => dayjs(period.date));
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
  }, [monthPeriods, onSelectedWeeksChange, getWeeksInMonth]);

  // Reset the initialization flag when key props change
  useEffect(() => {
    // If initialMonths change, we should re-initialize
    if (initialMonths && initialMonths.length > 0) {
      // Create a string representation of initialMonths for comparison
      const monthsString = initialMonths
        .map((m) => m.format("YYYY-MM"))
        .join(",");
      const currentMonthsString = monthPeriods
        .map((p) => p.date.format("YYYY-MM"))
        .join(",");

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
  const handleYearMonthChange = useCallback(
    (monthId: string, year: number, month: number) => {
      // Create a completely new dayjs object to avoid reference issues
      const newDate = dayjs().year(year).month(month).startOf("month");

      // Update month periods
      setMonthPeriods((prev) =>
        prev.map((period) => {
          if (period.id === monthId) {
            return {
              ...period,
              date: dayjs(newDate), // Create new instance to prevent reference issues
            };
          }
          return period;
        })
      );
    },
    []
  );

  // Add new month
  const handleAddMonth = useCallback(() => {
    if (monthPeriods.length === 0) return;

    const lastMonth = monthPeriods[monthPeriods.length - 1];
    // Create a new completely independent dayjs object
    const newDate = dayjs(lastMonth.date).add(1, "month").startOf("month");
    const newId = `month-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate the new date range to notify parent
    if (onDateRangeChange && state) {
      // Find earliest and latest dates in current months
      let earliestDate = state.from;
      let latestDate = state.to;

      // Check if the new month extends beyond the current range
      const newMonthStart = newDate.startOf("month");
      const newMonthEnd = newDate.endOf("month");

      // If the new month extends the range, update it
      if (newMonthEnd.isAfter(latestDate)) {
        console.log(
          "Extending date range to include new month:",
          newMonthEnd.format("YYYY-MM-DD")
        );
        onDateRangeChange(earliestDate, newMonthEnd, false);
      }
    }

    // Add the new month to the periods
    setMonthPeriods((prev) => [
      ...prev,
      {
        id: newId,
        date: newDate,
      },
    ]);

    console.log("Added new month:", newDate.format("YYYY-MM"));
  }, [monthPeriods, onDateRangeChange, state]);

  // Remove month
  const handleRemoveMonth = useCallback(
    (monthId: string) => {
      setMonthPeriods((prev) => {
        if (prev.length <= 1) return prev;

        // Filter out the month to be removed
        const updatedMonths = prev.filter((month) => month.id !== monthId);

        // After removing the month, calculate the new date range
        if (updatedMonths.length > 0 && onDateRangeChange && state) {
          // Find the earliest and latest dates in the remaining months
          let earliestDate = null;
          let latestDate = null;

          updatedMonths.forEach((month) => {
            const firstDay = month.date.startOf("month");
            const lastDay = month.date.endOf("month");

            if (earliestDate === null || firstDay.isBefore(earliestDate)) {
              earliestDate = firstDay;
            }

            if (latestDate === null || lastDay.isAfter(latestDate)) {
              latestDate = lastDay;
            }
          });

          // Notify parent of the new date range
          if (earliestDate && latestDate && onDateRangeChange) {
            console.log(
              "Month removed, updating date range:",
              earliestDate.format("YYYY-MM-DD"),
              "to",
              latestDate.format("YYYY-MM-DD")
            );

            // Delay the state update to next tick to avoid update during render
            queueMicrotask(() => {
              onDateRangeChange(earliestDate, latestDate, false);
            });
          }
        }

        return updatedMonths;
      });
    },
    [onDateRangeChange, state]
  );

  return {
    monthPeriods,
    handleYearMonthChange,
    handleAddMonth,
    handleRemoveMonth,
    getWeeksInMonth,
  };
};
