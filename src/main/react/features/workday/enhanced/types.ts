import dayjs from "dayjs";
import { LeaveDayClient } from "../../../clients/LeaveDayClient";
import { SickDayClient } from "../../../clients/SickDayClient";
import { EventClient } from "../../../clients/EventClient";

export type WorkDayState = {
  assignmentCode: string;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  days: number[] | null;
  hours: number;
  status: string;
  sheets: any[];
  personId?: string;
};

export type ExportStatusProps = {
  loading: boolean;
  link: string | null;
};

export type WorkDayProps = {
  personFullName: string;
  open: boolean;
  code?: string;
  onComplete?: (result?: any) => void;
};

export type CalendarDay = {
  date: dayjs.Dayjs;
  isCurrentMonth: boolean;
  dayOfMonth: number;
  hours: number;
  isSelected?: boolean;
};

export type CalendarWeek = {
  weekNumber: number;
  days: CalendarDay[];
};

export type EventData = {
  date: string;
  hours: number;
  description?: string;
};

export type LeaveData = {
  date: string;
  hours: number;
  description?: string;
  status?: string;
};

export type SickData = {
  date: string;
  hours: number;
  description?: string;
  status?: string;
};

// Period type for PeriodSelector
export type Period = {
  id: string;
  viewType: "month" | "week";
  date: dayjs.Dayjs;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
};

// Define the color codes for different types of days
export const EVENT_COLOR = "#FDE047"; // Yellow
export const VACATION_COLOR = "#38BDF8"; // Blue
export const SICKNESS_COLOR = "#B91C1C"; // Red
export const OVERLAP_COLOR = "#9CA3AF"; // Grey for overlapping workdays
