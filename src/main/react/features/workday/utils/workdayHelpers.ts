import dayjs from "dayjs";
import { EventData, LeaveData, SickData } from "../enhanced/types";

/**
 * Get unique months in a date range
 */
export const getUniqueMonthsInRange = (
  from: dayjs.Dayjs | null,
  to: dayjs.Dayjs | null
): dayjs.Dayjs[] => {
  if (!from || !to) return [];

  const months: dayjs.Dayjs[] = [];
  // Create a new dayjs object to avoid mutation issues
  let currentDate = dayjs(from).startOf("month");
  const endDate = dayjs(to).endOf("month");

  // Ensure the month keys are distinct - format them to year-month
  const uniqueMonths = new Set<string>();

  while (currentDate.isSameOrBefore(endDate, "month")) {
    const monthKey = currentDate.format("YYYY-MM");

    if (!uniqueMonths.has(monthKey)) {
      uniqueMonths.add(monthKey);
      // Create a new instance for each month to avoid reference issues
      months.push(dayjs(currentDate));
    }

    // Move to the next month
    currentDate = currentDate.add(1, "month");
  }

  return months;
};

/**
 * Check if a date is a weekend day
 */
export const isWeekend = (date: dayjs.Dayjs): boolean => {
  const day = date.day();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
};

/**
 * Check if a date is a free day based on settings from localStorage
 */
export const isFreeDayDate = (date: dayjs.Dayjs): boolean => {
  // Get the free day settings from localStorage
  const freeDaySettingsStr = localStorage.getItem("freeDaySettings");
  if (!freeDaySettingsStr) return false;

  try {
    const freeDaySettings = JSON.parse(freeDaySettingsStr);
    if (!freeDaySettings.enabled) return false;

    // Check if the day of the week matches
    if (date.day() !== freeDaySettings.dayOfWeek) return false;

    // Handle frequency
    if (freeDaySettings.frequency === "every") {
      return true;
    } else if (freeDaySettings.frequency === "odd") {
      const weekNumber = date.week();
      return weekNumber % 2 !== 0;
    } else if (freeDaySettings.frequency === "even") {
      const weekNumber = date.week();
      return weekNumber % 2 === 0;
    }
  } catch (e) {
    console.error("Error parsing free day settings:", e);
    return false;
  }

  return false;
};

/**
 * Get event hours for a specific date
 */
export const getEventHours = (
  date: dayjs.Dayjs,
  events: EventData[]
): number => {
  const formattedDate = date.format("YYYY-MM-DD");
  const event = events.find((e) => e.date === formattedDate);
  return event ? Number(event.hours) || 0 : 0;
};

/**
 * Get leave hours for a specific date
 */
export const getLeaveHours = (
  date: dayjs.Dayjs,
  leaveData: LeaveData[]
): number => {
  const formattedDate = date.format("YYYY-MM-DD");
  const leave = leaveData.find((l) => l.date === formattedDate);
  return leave ? Number(leave.hours) || 0 : 0;
};

/**
 * Get sick hours for a specific date
 */
export const getSickHours = (
  date: dayjs.Dayjs,
  sickData: SickData[]
): number => {
  const formattedDate = date.format("YYYY-MM-DD");
  const sick = sickData.find((s) => s.date === formattedDate);
  return sick ? Number(sick.hours) || 0 : 0;
};

/**
 * Get total special hours (events, leave, sick) for a specific date
 */
export const getSpecialHours = (
  date: dayjs.Dayjs,
  events: EventData[],
  leaveData: LeaveData[],
  sickData: SickData[]
): number => {
  return (
    getEventHours(date, events) +
    getLeaveHours(date, leaveData) +
    getSickHours(date, sickData)
  );
};
