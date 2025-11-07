import React, { useEffect, useState, useCallback, useRef } from "react";
import { Box, Dialog, DialogContent, Divider, Grid } from "@material-ui/core";
import WorkIcon from "@material-ui/icons/Work";
import { ConfirmDialog } from "@flock-community/flock-eco-core/src/main/react/components/ConfirmDialog";
import Typography from "@material-ui/core/Typography";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import {
  WorkDayClient,
  WORK_DAY_PAGE_SIZE,
} from "../../../clients/WorkDayClient";
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
import {
  WorkDayProps,
  WorkDayState,
  ExportStatusProps,
  EventData,
  LeaveData,
  SickData,
} from "./types";
import { usePerson } from "../../../hooks/PersonHook";
import { useWorkdayData } from "../hooks/useWorkdayData";
import {
  isWeekend,
  isFreeDayDate,
  getEventHours,
  getLeaveHours,
  getSickHours,
  getSpecialHours,
} from "../utils/workdayHelpers";

// Extend dayjs with needed plugins
dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

export function EnhancedWorkDayDialog({
  personFullName,
  open,
  code,
  onComplete,
}: WorkDayProps) {
  const classes = useStyles();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showWeekends, setShowWeekends] = useState<boolean>(false);

  // Initialize with null to ensure we set it properly when data loads
  const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs | null>(null);
  const [state, setState] = useState<WorkDayState | null>(null);
  // NEW: Add state to track all displayed months - using useRef to prevent render loops
  const initialMonthsRef = useRef<dayjs.Dayjs[]>([]);
  const [exportLink, setExportLink] = useState<ExportStatusProps>({
    loading: false,
    link: null,
  });

  // Track the previous code value to detect changes
  const [prevCode, setPrevCode] = useState<string | undefined>(undefined);

  // NEW: Add state to track selected weeks across all month periods
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

  // Use the person hook to get the current person
  const [person] = usePerson();

  // Use workday data hook for fetching events, leave, sick days, and overlapping workdays
  const {
    events,
    leaveData,
    sickData,
    overlappingWorkdays,
    loading: dataLoading,
  } = useWorkdayData({
    personId: person?.uuid,
    currentMonth,
    currentWorkdayCode: code,
    enabled: open,
  });

  // For debugging
  const logRef = useRef(false);

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
    if (!open) return;

    const loadWorkday = async () => {
      try {
        if (code) {
          const res = await WorkDayClient.get(code);
          const workDayState = {
            assignmentCode: res.assignment.code,
            from: res.from,
            to: res.to,
            days: res.days,
            hours: res.hours,
            status: res.status,
            sheets: res.sheets,
            personId: person?.uuid,
          };

          setState(workDayState);

          // When editing an existing workday, determine all months in the range
          // Extract all months from the state's date range
          const months = [];
          let current = dayjs(res.from).startOf("month");
          const end = dayjs(res.to).endOf("month");

          // Add all months in the date range
          while (current.isSameOrBefore(end, "month")) {
            months.push(dayjs(current));
            current = current.add(1, "month");
          }

          // Debug logging - only do once
          if (!logRef.current) {
            console.log(
              "Loading existing workday with range:",
              res.from.format("YYYY-MM-DD"),
              "to",
              res.to.format("YYYY-MM-DD")
            );
            console.log(
              "Detected months:",
              months.map((m) => m.format("YYYY-MM"))
            );
            logRef.current = true;
          }

          // Set the first month as current and all months as displayed
          if (months.length > 0) {
            setCurrentMonth(months[0]);
            initialMonthsRef.current = months;
          }
        } else {
          // For new workdays, initialize with current person
          const now = dayjs();
          const initialState = {
            ...schema.cast(),
            from: now, // Ensure from is a Dayjs object, not Date
            to: now, // Ensure to is a Dayjs object, not Date
            personId: person?.uuid || null,
          };
          setState(initialState);

          // For new workdays, use the current month
          setCurrentMonth(now);
          initialMonthsRef.current = [now.startOf("month")];
        }
      } catch (error) {
        console.error("Error loading workday data:", error);
        // TODO: Add user-facing error message
      }
    };

    loadWorkday();
  }, [open, code, person]);

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
        const dayDate = it.from.clone().add(i, "day");
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
      sheets: it.sheets,
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
  const handleDayHoursChange = (
    date: dayjs.Dayjs,
    hours: number,
    type: string = "regular"
  ) => {
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
      setState(newState);
    }
  };

  // Handle date range change with resetDays parameter
  const handleDateRangeChange = (
    from: dayjs.Dayjs,
    to: dayjs.Dayjs,
    resetDays: boolean = false
  ) => {
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

    setState(newState);

    // Update the months if necessary
    const allMonths = [];
    let currentDate = dayjs(from).startOf("month");
    const endDate = dayjs(to).endOf("month");

    while (currentDate.isSameOrBefore(endDate, "month")) {
      allMonths.push(dayjs(currentDate));
      currentDate = currentDate.add(1, "month");
    }

    if (allMonths.length > 0) {
      initialMonthsRef.current = allMonths;
      console.log(
        "Updated months based on new date range:",
        allMonths.map((m) => m.format("YYYY-MM"))
      );
    }
  };

  // Function to determine if a date is in the workday date range
  const isInWorkdayRange = (date: dayjs.Dayjs): boolean => {
    if (!state || !state.from || !state.to) return false;
    return date.isBetween(state.from, state.to, "day", "[]");
  };

  // Check if a date is within any of the visible months
  const isInCurrentVisibleMonth = (date: dayjs.Dayjs): boolean => {
    if (!currentMonth) return false;

    // Check if we have multiple months through initialMonthsRef
    if (initialMonthsRef.current.length > 0) {
      return initialMonthsRef.current.some((month) => {
        const startOfMonth = month.startOf("month");
        const endOfMonth = month.endOf("month");
        return date.isBetween(startOfMonth, endOfMonth, "day", "[]");
      });
    }

    // Fallback to just checking current month
    const startOfMonth = currentMonth.startOf("month");
    const endOfMonth = currentMonth.endOf("month");
    return date.isBetween(startOfMonth, endOfMonth, "day", "[]");
  };

  // Find the index of a date in the days array
  const getDayIndex = (date: dayjs.Dayjs): number => {
    if (!state || !state.from) return -1;
    return date.diff(state.from, "day");
  };

  // Improved quick fill - now supports targeting a specific month
  const handleQuickFill = (targetHours: number, targetMonth?: dayjs.Dayjs) => {
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
    setState({
      ...newState,
      days: newDays,
    });
  };

  // Toggle weekend visibility
  const handleToggleWeekends = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowWeekends(event.target.checked);
  };

  // Handle updates to month list from CalendarGrid
  // This updates our reference to the current months without causing re-renders
  const handleMonthsChange = useCallback(
    (months: dayjs.Dayjs[]) => {
      if (months && months.length > 0) {
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
          setCurrentMonth(months[0]);
        }
      }
    },
    [currentMonth]
  );

  // Render the form elements (assignment, status, etc.)
  const renderFormFields = () => {
    if (!state || !currentMonth) return null;

    // Show loading message if person is not loaded yet or doesn't have uuid
    if (!person || !person.uuid) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <Typography>Loading...</Typography>
        </Box>
      );
    }

    // Force initialMonthsRef to have at least one month
    if (initialMonthsRef.current.length === 0 && currentMonth) {
      initialMonthsRef.current = [currentMonth.startOf("month")];
    }

    // Check if period spans multiple months and ensure all months are included
    if (state && state.from && state.to) {
      const fromMonth = dayjs(state.from).startOf("month");
      const toMonth = dayjs(state.to).startOf("month");

      // If from and to are in different months, make sure both are in initialMonthsRef
      if (
        !fromMonth.isSame(toMonth, "month") &&
        initialMonthsRef.current.length < 2
      ) {
        console.log(
          "Period spans multiple months:",
          fromMonth.format("YYYY-MM"),
          toMonth.format("YYYY-MM")
        );

        // Create a comprehensive list of all months in the range
        const months = [];
        let current = dayjs(fromMonth);

        while (current.isSameOrBefore(toMonth, "month")) {
          months.push(dayjs(current)); // Create new instance to avoid reference issues
          current = current.add(1, "month");
        }

        // Update initialMonthsRef if we found multiple months
        if (months.length > 1) {
          console.log(
            "Updating initialMonthsRef to include all",
            months.length,
            "months"
          );
          initialMonthsRef.current = months;
        }
      }
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
                  overlappingWorkdays={overlappingWorkdays}
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
