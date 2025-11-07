import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { EventClient } from "../../../clients/EventClient";
import {
  LeaveDayClient,
  LEAVE_DAY_PAGE_SIZE,
} from "../../../clients/LeaveDayClient";
import {
  SickDayClient,
  SICKDAY_PAGE_SIZE,
} from "../../../clients/SickDayClient";
import {
  WorkDayClient,
  WORK_DAY_PAGE_SIZE,
} from "../../../clients/WorkDayClient";
import {
  EventData,
  LeaveData,
  SickData,
  WorkDayState,
} from "../enhanced/types";

// Helper function to fetch all pages of data
const fetchAllPages = async (fetchFn, pageSize) => {
  let page = 0;
  let allData = [];
  let hasMore = true;

  // Continue fetching until there's no more data
  while (hasMore) {
    const response = await fetchFn(page);
    const items = response.list || [];
    allData = [...allData, ...items];

    // Check if we've reached the last page
    hasMore = items.length === pageSize;
    page++;
  }

  return allData;
};

// Function to fetch events, leave days, and sick days
const fetchAdditionalData = async (
  personId: string,
  currentMonth: dayjs.Dayjs | null
) => {
  if (!personId || !currentMonth) {
    return {
      events: [],
      leaveData: [],
      sickData: [],
    };
  }

  try {
    // Fetch all events
    const allEvents = await fetchAllPages(
      (page) => EventClient.getAll(page),
      10
    );
    const personEvents = allEvents.filter((event) =>
      event.persons.some((p) => p.uuid === personId)
    );

    // Format events data
    const formattedEvents = personEvents.flatMap((event) => {
      const days: EventData[] = [];
      const startDate = event.from;
      const endDate = event.to;

      let currentDate = startDate;
      let dayIndex = 0;
      while (currentDate.isSameOrBefore(endDate, "day")) {
        // Use per-day hours from the days array if available, otherwise use total hours
        const hoursForDay =
          event.days && event.days.length > dayIndex
            ? event.days[dayIndex]
            : event.hours;

        days.push({
          date: currentDate.format("YYYY-MM-DD"),
          hours: hoursForDay,
          description: event.description,
        });
        currentDate = currentDate.add(1, "day");
        dayIndex++;
      }

      return days;
    });

    // Group events by date and take only the first event for each date
    const eventsMap = new Map<string, EventData>();
    formattedEvents.forEach((event) => {
      if (!eventsMap.has(event.date)) {
        eventsMap.set(event.date, event);
      }
    });

    const events = Array.from(eventsMap.values());

    // Fetch all leave days (vacation) for the person
    const allLeaveDays = await fetchAllPages(
      (page) => LeaveDayClient.findAllByPersonId(personId, page),
      LEAVE_DAY_PAGE_SIZE
    );

    // Format leave days data
    const formattedLeaveDays = allLeaveDays.flatMap((leaveDay) => {
      const days: LeaveData[] = [];
      const startDate = leaveDay.from;
      const endDate = leaveDay.to;

      let currentDate = startDate;
      while (currentDate.isSameOrBefore(endDate, "day")) {
        days.push({
          date: currentDate.format("YYYY-MM-DD"),
          // Ensure leave hours are capped at 8
          hours: Math.min(leaveDay.hours || 8, 8),
          description: leaveDay.description,
          status: leaveDay.status,
        });
        currentDate = currentDate.add(1, "day");
      }

      return days;
    });

    // Group leave days by date
    const leaveDaysMap = new Map<string, LeaveData>();
    formattedLeaveDays.forEach((leaveDay) => {
      const dateKey = leaveDay.date;
      if (!leaveDaysMap.has(dateKey)) {
        leaveDaysMap.set(dateKey, leaveDay);
      } else {
        // If there's already an entry for this date, don't add a duplicate
        // Just update status to APPROVED if any of the entries are approved
        if (
          leaveDay.status === "APPROVED" &&
          leaveDaysMap.get(dateKey).status !== "APPROVED"
        ) {
          leaveDaysMap.set(dateKey, {
            ...leaveDaysMap.get(dateKey),
            status: "APPROVED",
          });
        }
      }
    });

    const leaveData = Array.from(leaveDaysMap.values());

    // Fetch all sick days for the person
    const allSickDays = await fetchAllPages(
      (page) => SickDayClient.findAllByPersonId(personId, page),
      SICKDAY_PAGE_SIZE
    );

    // Format sick days data
    const formattedSickDays = allSickDays.flatMap((sickDay) => {
      const days: SickData[] = [];
      const startDate = sickDay.from;
      const endDate = sickDay.to;

      let currentDate = startDate;
      while (currentDate.isSameOrBefore(endDate, "day")) {
        days.push({
          date: currentDate.format("YYYY-MM-DD"),
          // Ensure sick hours are capped at 8
          hours: Math.min(sickDay.hours || 8, 8),
          description: sickDay.description,
          status: sickDay.status,
        });
        currentDate = currentDate.add(1, "day");
      }

      return days;
    });

    // Group sick days by date
    const sickDaysMap = new Map<string, SickData>();
    formattedSickDays.forEach((sickDay) => {
      const dateKey = sickDay.date;
      if (!sickDaysMap.has(dateKey)) {
        sickDaysMap.set(dateKey, sickDay);
      } else {
        // If there's already an entry for this date, don't add a duplicate
        // Just update status to APPROVED if any of the entries are approved
        if (
          sickDay.status === "APPROVED" &&
          sickDaysMap.get(dateKey).status !== "APPROVED"
        ) {
          sickDaysMap.set(dateKey, {
            ...sickDaysMap.get(dateKey),
            status: "APPROVED",
          });
        }
      }
    });

    const sickData = Array.from(sickDaysMap.values());

    return { events, leaveData, sickData };
  } catch (error) {
    console.error("Error fetching additional data:", error);
    return {
      events: [],
      leaveData: [],
      sickData: [],
    };
  }
};

// Function to fetch overlapping workdays for the person
const fetchOverlappingWorkdays = async (
  personId: string,
  currentWorkdayCode?: string
) => {
  if (!personId) return [];

  try {
    // Fetch all workdays for the person
    const allWorkdays = [];
    let page = 0;
    let hasMore = true;

    // Fetch all pages of workdays
    while (hasMore) {
      const response = await WorkDayClient.findAllByPersonUuid(personId, page);
      if (response && response.list && response.list.length > 0) {
        allWorkdays.push(...response.list);
        hasMore = response.list.length === WORK_DAY_PAGE_SIZE;
      } else {
        hasMore = false;
      }
      page++;
    }

    // Filter out the current workday and convert to WorkDayState format
    const overlappingWorkdaysList = allWorkdays
      .filter((workday) => workday.code !== currentWorkdayCode) // exclude current workday
      .map((workday) => ({
        assignmentCode: workday.assignment.code,
        from: workday.from,
        to: workday.to,
        days: workday.days,
        hours: workday.hours,
        status: workday.status,
        sheets: workday.sheets,
        personId: personId,
      }));

    return overlappingWorkdaysList;
  } catch (error) {
    console.error("Error fetching overlapping workdays:", error);
    return [];
  }
};

interface UseWorkdayDataParams {
  personId?: string;
  currentMonth: dayjs.Dayjs | null;
  currentWorkdayCode?: string;
  enabled: boolean;
}

interface UseWorkdayDataReturn {
  events: EventData[];
  leaveData: LeaveData[];
  sickData: SickData[];
  overlappingWorkdays: WorkDayState[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useWorkdayData({
  personId,
  currentMonth,
  currentWorkdayCode,
  enabled,
}: UseWorkdayDataParams): UseWorkdayDataReturn {
  const [events, setEvents] = useState<EventData[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);
  const [sickData, setSickData] = useState<SickData[]>([]);
  const [overlappingWorkdays, setOverlappingWorkdays] = useState<
    WorkDayState[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!enabled || !personId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [additionalData, overlaps] = await Promise.all([
        fetchAdditionalData(personId, currentMonth),
        fetchOverlappingWorkdays(personId, currentWorkdayCode),
      ]);

      setEvents(additionalData.events);
      setLeaveData(additionalData.leaveData);
      setSickData(additionalData.sickData);
      setOverlappingWorkdays(overlaps);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      console.error("Error fetching workday data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [personId, currentMonth, currentWorkdayCode, enabled]);

  return {
    events,
    leaveData,
    sickData,
    overlappingWorkdays,
    loading,
    error,
    refetch: fetchData,
  };
}
