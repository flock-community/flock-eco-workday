import React, { useEffect, useState, useCallback, useRef } from "react";
import { Box, Dialog, DialogContent, Divider, Grid } from "@material-ui/core";
import WorkIcon from "@material-ui/icons/Work";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { WorkDayClient } from "../../../clients/WorkDayClient";
import { TransitionSlider } from "../../../components/transitions/Slide";
import { DialogFooter, DialogHeader } from "../../../components/dialog";
import { schema, WORKDAY_FORM_ID } from "../WorkDayForm";
import { isDefined } from "../../../utils/validation";
import { ISO_8601_DATE } from "../../../clients/util/DateFormats";
import Button from "@material-ui/core/Button";
import { ExportClient } from "../../../clients/ExportClient";
import Snackbar from "@material-ui/core/Snackbar";
import dayjs from "dayjs";
import { Form, Formik } from "formik";
import { AssignmentSelectorField } from "../../../components/fields/AssignmentSelectorField";
import { StatusSelect } from "../../../components/status/StatusSelect";
import { DropzoneAreaField } from "../../../components/fields/DropzoneAreaField";
import isoWeek from "dayjs/plugin/isoWeek";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useStyles } from "./styles";
import { CalendarGrid } from "./CalendarGrid";
import { WorkDayProps, WorkDayState, ExportStatusProps, EventData, LeaveData, SickData } from "./types";
import { EventClient } from "../../../clients/EventClient";
import { LeaveDayClient, LEAVE_DAY_PAGE_SIZE } from "../../../clients/LeaveDayClient";
import { SickDayClient, SICKDAY_PAGE_SIZE } from "../../../clients/SickDayClient";
import { usePerson } from "../../../hooks/PersonHook";

// Extend dayjs with needed plugins
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

// Helper function to get unique months in a date range
const getUniqueMonthsInRange = (from, to) => {
  if (!from || !to) return [];
  
  const months = [];
  // Create a new dayjs object to avoid mutation issues
  let currentDate = dayjs(from).startOf('month');
  const endDate = dayjs(to).endOf('month');
  
  // Ensure the month keys are distinct - format them to year-month
  const uniqueMonths = new Set();
  
  while (currentDate.isSameOrBefore(endDate, 'month')) {
    const monthKey = currentDate.format('YYYY-MM');
    
    if (!uniqueMonths.has(monthKey)) {
      uniqueMonths.add(monthKey);
      // Create a new instance for each month to avoid reference issues
      months.push(dayjs(currentDate));
    }
    
    // Move to the next month
    currentDate = currentDate.add(1, 'month');
  }
  
  return months;
};

export function EnhancedWorkDayDialog({ personFullName, open, code, onComplete }: WorkDayProps) {
  const classes = useStyles();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showWeekends, setShowWeekends] = useState<boolean>(false);

  // Initialize with null to ensure we set it properly when data loads
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs | null>(null);
  const [state, setState] = useState<WorkDayState | null>(null);
  const [events, setEvents] = useState<EventData[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveData[]>([]);
  const [sickData, setSickData] = useState<SickData[]>([]);
  // NEW: Add state to track all displayed months - using useRef to prevent render loops
  const initialMonthsRef = useRef<dayjs.Dayjs[]>([]);
  const [exportLink, setExportLink] = useState<ExportStatusProps>({
    loading: false,
    link: null,
  });
  // Force re-render without recreating components
  const [renderTrigger, setRenderTrigger] = useState(0);

  // Track the previous code value to detect changes
  const [prevCode, setPrevCode] = useState<string | undefined>(undefined);

  // NEW: Add state to track selected weeks across all month periods
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

  // Use the person hook to get the current person
  const [person] = usePerson();
  
  // For debugging
  const logRef = useRef(false);

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

  // Function to fetch events, leave days, and sick days for the current month
  const fetchAdditionalData = async (personId: string) => {
    if (!personId || !currentMonth) return;

    try {
      // Fetch all events
      const allEvents = await fetchAllPages((page) => EventClient.getAll(page), 10);
      const personEvents = allEvents.filter(event =>
        event.persons.some(p => p.uuid === personId)
      );

      // Format events data
      const formattedEvents = personEvents.flatMap(event => {
        const days: EventData[] = [];
        const startDate = event.from;
        const endDate = event.to;

        let currentDate = startDate;
        while (currentDate.isSameOrBefore(endDate, 'day')) {
          days.push({
            date: currentDate.format('YYYY-MM-DD'),
            hours: event.hours,
            description: event.description
          });
          currentDate = currentDate.add(1, 'day');
        }

        return days;
      });

      // Group events by date and take only the first event for each date
      const eventsMap = new Map<string, EventData>();
      formattedEvents.forEach(event => {
        if (!eventsMap.has(event.date)) {
          eventsMap.set(event.date, event);
        }
      });

      setEvents(Array.from(eventsMap.values()));

      // Fetch all leave days (vacation) for the person
      const allLeaveDays = await fetchAllPages(
        (page) => LeaveDayClient.findAllByPersonId(personId, page),
        LEAVE_DAY_PAGE_SIZE
      );

      // Format leave days data
      const formattedLeaveDays = allLeaveDays.flatMap(leaveDay => {
        const days: LeaveData[] = [];
        const startDate = leaveDay.from;
        const endDate = leaveDay.to;

        let currentDate = startDate;
        while (currentDate.isSameOrBefore(endDate, 'day')) {
          days.push({
            date: currentDate.format('YYYY-MM-DD'),
            // Ensure leave hours are capped at 8
            hours: Math.min(leaveDay.hours || 8, 8),
            description: leaveDay.description,
            status: leaveDay.status
          });
          currentDate = currentDate.add(1, 'day');
        }

        return days;
      });

      // Group leave days by date
      const leaveDaysMap = new Map<string, LeaveData>();
      formattedLeaveDays.forEach(leaveDay => {
        const dateKey = leaveDay.date;
        if (!leaveDaysMap.has(dateKey)) {
          leaveDaysMap.set(dateKey, leaveDay);
        } else {
          // If there's already an entry for this date, don't add a duplicate
          // Just update status to APPROVED if any of the entries are approved
          if (leaveDay.status === 'APPROVED' && leaveDaysMap.get(dateKey).status !== 'APPROVED') {
            leaveDaysMap.set(dateKey, {
              ...leaveDaysMap.get(dateKey),
              status: 'APPROVED'
            });
          }
        }
      });

      setLeaveData(Array.from(leaveDaysMap.values()));

      // Fetch all sick days for the person
      const allSickDays = await fetchAllPages(
        (page) => SickDayClient.findAllByPersonId(personId, page),
        SICKDAY_PAGE_SIZE
      );

      // Format sick days data
      const formattedSickDays = allSickDays.flatMap(sickDay => {
        const days: SickData[] = [];
        const startDate = sickDay.from;
        const endDate = sickDay.to;

        let currentDate = startDate;
        while (currentDate.isSameOrBefore(endDate, 'day')) {
          days.push({
            date: currentDate.format('YYYY-MM-DD'),
            // Ensure sick hours are capped at 8
            hours: Math.min(sickDay.hours || 8, 8),
            description: sickDay.description,
            status: sickDay.status
          });
          currentDate = currentDate.add(1, 'day');
        }

        return days;
      });

      // Group sick days by date
      const sickDaysMap = new Map<string, SickData>();
      formattedSickDays.forEach(sickDay => {
        const dateKey = sickDay.date;
        if (!sickDaysMap.has(dateKey)) {
          sickDaysMap.set(dateKey, sickDay);
        } else {
          // If there's already an entry for this date, don't add a duplicate
          // Just update status to APPROVED if any of the entries are approved
          if (sickDay.status === 'APPROVED' && sickDaysMap.get(dateKey).status !== 'APPROVED') {
            sickDaysMap.set(dateKey, {
              ...sickDaysMap.get(dateKey),
              status: 'APPROVED'
            });
          }
        }
      });

      setSickData(Array.from(sickDaysMap.values()));

    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  };

  // Reset dialog state when it closes
  useEffect(() => {
    if (!open) {
      // Reset everything when dialog closes
      setState(null);
      setPrevCode(undefined);
      initialMonthsRef.current = [];
      logRef.current = false;
    }
  }, [open]);

  // Complete reset when code changes
  useEffect(() => {
    if (code !== prevCode) {
      // Code has changed, reset the state
      setState(null);
      setCurrentMonth(null);
      initialMonthsRef.current = [];
      logRef.current = false;

      // Update the previous code
      setPrevCode(code);
    }
  }, [code, prevCode]);

  // Load data when dialog opens or code changes
  useEffect(() => {
    if (open) {
      if (code) {
        WorkDayClient.get(code).then((res) => {
          const workDayState = {
            assignmentCode: res.assignment.code,
            from: res.from,
            to: res.to,
            days: res.days,
            hours: res.hours,
            status: res.status,
            sheets: res.sheets,
            personId: person?.uuid
          };

          setState(workDayState);

          // When editing an existing workday, determine all months in the range
          const allMonths = getUniqueMonthsInRange(res.from, res.to);
          
          // Debug logging - only do once
          if (!logRef.current) {
            console.log("Loading existing workday with range:", 
                        res.from.format('YYYY-MM-DD'), "to", 
                        res.to.format('YYYY-MM-DD'));
            console.log("Detected months:", allMonths.map(m => m.format('YYYY-MM')));
            logRef.current = true;
          }
          
          // Set the first month as current and all months as displayed
          if (allMonths.length > 0) {
            setCurrentMonth(allMonths[0]);
            initialMonthsRef.current = allMonths;
          }

          // Fetch additional data if we have a person ID
          if (person?.uuid) {
            // We'll wait for currentMonth to be updated in the next render cycle
            setTimeout(() => {
              fetchAdditionalData(person.uuid);
            }, 0);
          }
        });
      } else {
        setState(schema.cast());

        // For new workdays, use the current month
        const now = dayjs();
        setCurrentMonth(now);
        initialMonthsRef.current = [now.startOf('month')];

        // Fetch additional data if we have a person ID
        if (person?.uuid) {
          // We'll wait for currentMonth to be updated in the next render cycle
          setTimeout(() => {
            fetchAdditionalData(person.uuid);
          }, 0);
        }
      }
    }
  }, [open, code, person]);

  // Refetch additional data when month changes
  useEffect(() => {
    if (person?.uuid && currentMonth) {
      fetchAdditionalData(person.uuid);
    }
  }, [currentMonth, person]);

  // NEW: Update selected weeks - use useCallback to prevent infinite loops
  const handleSelectedWeeksChange = useCallback((weeks: number[]) => {
    setSelectedWeeks(weeks);
  }, []);

  // Handle form submission
  const handleSubmit = (it) => {
    setProcessing(true);

    // Clone the days array to avoid modifying the original
    let processedDays = it.days ? [...it.days] : null;

    // NEW: Filter out hours from days in disabled weeks
    if (processedDays && processedDays.length > 0) {
      // Create an array to track whether each day should be included
      const includeDayFlags = Array(processedDays.length).fill(false);

      // For each day, determine if it belongs to a selected week
      for (let i = 0; i < processedDays.length; i++) {
        const dayDate = it.from.clone().add(i, 'day');
        const weekNumber = dayDate.isoWeek();

        // If the week is selected, this day should be included
        if (selectedWeeks.includes(weekNumber)) {
          includeDayFlags[i] = true;
        }
      }

      // Now zero out the hours for days in disabled weeks
      for (let i = 0; i < processedDays.length; i++) {
        if (!includeDayFlags[i]) {
          processedDays[i] = 0;
        }
      }
    }

    // Calculate total hours only from selected days
    const totalHours = processedDays
      ? processedDays.reduce((acc, cur) => acc + parseFloat(cur || 0), 0)
      : it.hours;

    const body = {
      from: it.from.format(ISO_8601_DATE),
      to: it.to.format(ISO_8601_DATE),
      days: processedDays ? processedDays : null,
      hours: totalHours,
      assignmentCode: it.assignmentCode,
      status: it.status,
      sheets: it.sheets
    };

    if (code) {
      return WorkDayClient.put(code, body).then((res) => {
        if (isDefined(onComplete)) {
          setProcessing(false);
          onComplete(res);
        }
        setState(null);
      });
    } else {
      return WorkDayClient.post(body).then((res) => {
        if (isDefined(onComplete)) onComplete(res);
        setState(null);
        setProcessing(false);
      });
    }
  };

  // Delete workday
  const handleDelete = () => {
    WorkDayClient.delete(code).then(() => {
      if (isDefined(onComplete)) onComplete();
      setOpenDelete(false);
      setProcessing(true);
    });
  };

  const handleDeleteOpen = () => {
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
  };

  const handleClose = () => {
    if (isDefined(onComplete)) onComplete();
    setState(null);
  };

  // Export functionality
  const handleExport =
    code && UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
      ? async () => {
          setExportLink({ loading: true, link: null });
          const response = await ExportClient().exportWorkday(code);
          setExportLink({ loading: false, link: response.link });
          setProcessing(true);
        }
      : null;

  const headline = UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN")
    ? `Create Workday | ${personFullName}`
    : "Create Workday";

  function clearExportLink() {
    setExportLink({
      loading: false,
      link: null,
    });
  }

  // Update hours for a specific day
  const handleDayHoursChange = (date, hours, type = 'regular') => {
    if (!state) return;

    // Clone the current state to avoid direct mutation
    const newState = { ...state };

    if (type === 'regular') {
      // Check if the date is within the current range
      const isWithinRange = date.isBetween(newState.from, newState.to, 'day', '[]');

      if (isWithinRange) {
        // Calculate the index in the days array
        const dayIndex = date.diff(newState.from, 'day');

        // Update the existing day
        if (newState.days) {
          const newDays = [...newState.days];
          newDays[dayIndex] = hours;
          newState.days = newDays;
        } else {
          // Initialize days array if needed
          const dayCount = newState.to.diff(newState.from, 'day') + 1;
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
        const newDayCount = newTo.diff(newFrom, 'day') + 1;

        // Create a new days array with all zeros
        const newDays = Array(newDayCount).fill(0);

        // Copy existing days data to the correct position in the new array
        if (newState.days) {
          const offset = newFrom.diff(newState.from, 'day');

          for (let i = 0; i < newState.days.length; i++) {
            const newIndex = i - offset;
            if (newIndex >= 0 && newIndex < newDays.length) {
              newDays[newIndex] = newState.days[i];
            }
          }
        }

        // Set the hours for the clicked day
        const clickedDayIndex = date.diff(newFrom, 'day');
        newDays[clickedDayIndex] = hours;

        // Update the state with the new range and days
        newState.from = newFrom;
        newState.to = newTo;
        newState.days = newDays;
      }

      // Update the state
      setState(newState);
    }
  };

  // Handle date range change with resetDays parameter
  const handleDateRangeChange = (from, to, resetDays = false) => {
    if (!state) return;

    // Clone the current state to avoid direct mutation
    const newState = { ...state };

    // Calculate the new day count
    const newDayCount = to.diff(from, 'day') + 1;

    // Create a new days array or use the existing one
    let newDays;

    if (resetDays) {
      // If resetDays is true, create a completely new days array filled with zeros
      // This will clear any existing hours data when switching months
      newDays = Array(newDayCount).fill(0);
    } else {
      if (newState.days) {
        // If the range is reduced, truncate the array
        if (newDayCount <= newState.days.length) {
          newDays = newState.days.slice(0, newDayCount);
        } else {
          // If the range is expanded, add zeros for the new days
          newDays = [...newState.days];
          while (newDays.length < newDayCount) {
            newDays.push(0);
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

    setState(newState);
  };

  // Helper function to check if a date is a weekend day
  const isWeekend = (date) => {
    const day = date.day();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Helper function to check if a date is a free day based on settings
  const isFreeDayDate = (date) => {
    // Get the free day settings from localStorage
    const freeDaySettingsStr = localStorage.getItem('freeDaySettings');
    if (!freeDaySettingsStr) return false;

    try {
      const freeDaySettings = JSON.parse(freeDaySettingsStr);
      if (!freeDaySettings.enabled) return false;

      // Check if the day of the week matches
      if (date.day() !== freeDaySettings.dayOfWeek) return false;

      // Handle frequency
      if (freeDaySettings.frequency === 'every') {
        return true;
      } else if (freeDaySettings.frequency === 'odd') {
        const weekNumber = date.week();
        return weekNumber % 2 !== 0;
      } else if (freeDaySettings.frequency === 'even') {
        const weekNumber = date.week();
        return weekNumber % 2 === 0;
      }
    } catch (e) {
      console.error("Error parsing free day settings:", e);
      return false;
    }

    return false;
  };

  // Helper function to get event hours for a date
  const getEventHours = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const event = events.find(e => e.date === formattedDate);
    return event ? Number(event.hours) || 0 : 0;
  };

  // Helper function to get leave hours for a date
  const getLeaveHours = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const leave = leaveData.find(l => l.date === formattedDate);
    return leave ? Number(leave.hours) || 0 : 0;
  };

  // Helper function to get sick hours for a date
  const getSickHours = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const sick = sickData.find(s => s.date === formattedDate);
    return sick ? Number(sick.hours) || 0 : 0;
  };

  // Helper function to get total special hours (events, leave, sick) for a date
  const getSpecialHours = (date) => {
    return getEventHours(date) + getLeaveHours(date) + getSickHours(date);
  };

  // Function to determine if a date is in the workday date range
  const isInWorkdayRange = (date) => {
    if (!state || !state.from || !state.to) return false;
    return date.isBetween(state.from, state.to, 'day', '[]');
  };

  // Date is within the current visible month
  const isInCurrentVisibleMonth = (date) => {
    if (!currentMonth) return false;
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    return date.isBetween(startOfMonth, endOfMonth, 'day', '[]');
  };

  // Find the index of a date in the days array
  const getDayIndex = (date) => {
    if (!state || !state.from) return -1;
    return date.diff(state.from, 'day');
  };

  // Improved quick fill - now supports targeting a specific month
  const handleQuickFill = (targetHours, targetMonth) => {
    if (!state) return;

    // Clone the current state to avoid direct mutation
    const newState = { ...state };

    // Get the start and end of the target month, or use current month if not specified
    const monthDate = targetMonth || currentMonth;
    if (!monthDate) return;

    const startOfMonth = monthDate.startOf('month');
    const endOfMonth = monthDate.endOf('month');

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
      const newDayCount = newTo.diff(newFrom, 'day') + 1;

      // Create a new days array filled with zeros
      newDays = Array(newDayCount).fill(0);

      // Copy existing days data to the correct position in the new array
      if (newState.days) {
        const offset = newFrom.diff(newState.from, 'day');

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
        const newDayCount = newTo.diff(newFrom, 'day') + 1;
        newDays = Array(newDayCount).fill(0);
      }
    }

    // Now fill in the hours for each workday in the target month
    let currentDate = startOfMonth.clone();
    while (currentDate.isSameOrBefore(endOfMonth, 'day')) {
      // Check if the date is within the workday range
      if (currentDate.isBetween(newState.from, newState.to, 'day', '[]')) {
        // Get the index of this day in the days array
        const dayIndex = currentDate.diff(newState.from, 'day');

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
          const eventHrs = getEventHours(currentDate);
          const leaveHrs = getLeaveHours(currentDate);
          const sickHrs = getSickHours(currentDate);
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
      currentDate = currentDate.add(1, 'day');
    }

    // Update the state with the new days array
    setState({
      ...newState,
      days: newDays
    });

    // Force a re-render without changing the component key
    setRenderTrigger(prev => prev + 1);
  };

  // Toggle weekend visibility
  const handleToggleWeekends = (event) => {
    setShowWeekends(event.target.checked);
  };

  // Handle updates to month list from CalendarGrid
  // This is disconnected to prevent infinite loops - we only save internally and don't react to this
  const handleMonthsChange = useCallback((months: dayjs.Dayjs[]) => {
    // Just update our ref but don't trigger any re-renders
    // We will use this data when saving the form
    // Do nothing - we don't need to update state here
  }, []);

  // Render the form elements (assignment, status, etc.)
  const renderFormFields = () => {
    if (!state || !currentMonth) return null;

    // Force initialMonthsRef to have at least one month
    if (initialMonthsRef.current.length === 0 && currentMonth) {
      initialMonthsRef.current = [currentMonth.startOf('month')];
    }

    return (
      <Formik
        enableReinitialize
        initialValues={state}
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        {({ values, setFieldValue }) => (
          <Form id={WORKDAY_FORM_ID}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <AssignmentSelectorField
                  fullWidth
                  name="assignmentCode"
                  label="Assignment"
                  personId={person?.uuid}
                  from={values.from}
                  to={values.to}
                />
              </Grid>

              <UserAuthorityUtil has="WorkDayAuthority.ADMIN">
                <Grid item xs={12}>
                  <StatusSelect
                    value={values.status}
                    onChange={(newValue) => setFieldValue("status", newValue)}
                  />
                </Grid>
              </UserAuthorityUtil>

              <Grid item xs={12}>
                <CalendarGrid
                  // Don't use a key that changes with every render, as this recreates the component
                  // and loses internal state like the selected month
                  currentMonth={currentMonth}
                  state={state}
                  events={events}
                  leaveData={leaveData}
                  sickData={sickData}
                  showWeekends={showWeekends}
                  onMonthChange={setCurrentMonth}
                  onToggleWeekends={handleToggleWeekends}
                  onDayHoursChange={handleDayHoursChange}
                  onQuickFill={handleQuickFill}
                  onDateRangeChange={handleDateRangeChange}
                  onSelectedWeeksChange={handleSelectedWeeksChange}
                  initialMonths={initialMonthsRef.current}
                  onMonthsChange={handleMonthsChange}
                  values={values}
                  setFieldValue={setFieldValue}
                  renderTrigger={renderTrigger}
                />
              </Grid>

              <Grid item xs={12}>
                <DropzoneAreaField
                  name="sheets"
                  endpoint="/api/workdays/sheets"
                />
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    );
  };

  return (
    <>
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={TransitionSlider}
      >
        <DialogHeader
          icon={<WorkIcon />}
          headline={headline}
          subheadline="Add your workday."
          onClose={handleClose}
        />
        <DialogContent className={classes.dialogContent}>
          <UserAuthorityUtil has="WorkDayAuthority.ADMIN">
            <Box my="1rem">
              <Typography variant={"h5"} component={"h2"}>
                {personFullName}
              </Typography>
            </Box>
          </UserAuthorityUtil>
          {renderFormFields()}
        </DialogContent>
        <Divider />
        <DialogFooter
          formId={WORKDAY_FORM_ID}
          onClose={handleClose}
          onDelete={handleDeleteOpen}
          onExport={handleExport}
          disableDelete={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          disableEdit={
            !UserAuthorityUtil.hasAuthority("WorkDayAuthority.ADMIN") &&
            state &&
            state.status !== "REQUESTED"
          }
          processingExport={exportLink.loading}
          processing={processing}
        />
      </Dialog>
      <ConfirmDialog
        open={openDelete}
        onClose={handleDeleteClose}
        onConfirm={handleDelete}
      >
        <Typography>Are you sure you want to remove this workday.</Typography>
      </ConfirmDialog>
      <Snackbar
        open={exportLink.link != null}
        onClose={clearExportLink}
        autoHideDuration={6000}
      >
        <div className={classes.exportSnackBar}>
          <Typography className={classes.exportMessage}>
            Export of workday to google drive is done.
          </Typography>
          <Button
            onClick={clearExportLink}
            href={exportLink.link!}
            target="_blank"
          >
            Open in tab
          </Button>
        </div>
      </Snackbar>
    </>
  );
}
